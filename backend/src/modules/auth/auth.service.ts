import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import slugify from 'slugify';
import { objectIdToString } from '../../utils/objectIdToString';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { Tenant, TenantDocument } from '../../database/schemas/tenant.schema';
import { TenantRegisterDto } from './dto/tenant-register.dto';
import { SimpleRegisterDto } from './dto/auth.dto';
import { AuthTokenService } from './services/auth-token.service';
import { TokenType } from './schemas/auth-token.schema';
import { EmailService } from '../settings/email.service';
import { Role } from '../users/role.types';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
    private readonly jwtService: JwtService,
    private readonly authTokenService: AuthTokenService,
    private readonly emailService: EmailService,
  ) {}

  async logout(): Promise<{ success: true }> {
    return { success: true };
  }

  async trackOAuthStart(provider: 'google' | 'github'): Promise<void> {
    void provider;
  }

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<UserDocument, 'password'>> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userModel
      .findOne({ email: normalizedEmail })
      .exec();
    console.log('[VALIDATE USER] Lookup for email:', email, 'Result:', user);
    if (!user) {
      console.error('[VALIDATE USER] User not found for email:', email);
      throw new UnauthorizedException('User not found');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    console.log(
      '[VALIDATE USER] Password compare for email:',
      email,
      'isMatch:',
      isMatch,
    );
    if (!isMatch) {
      console.error('[VALIDATE USER] Incorrect password for email:', email);
      throw new UnauthorizedException('Incorrect password');
    }

    const userObj = user.toObject() as any;
    if (userObj && Object.prototype.hasOwnProperty.call(userObj, 'password')) {
      delete userObj.password;
    }
    // Ensure tenantId is a string
    if (userObj.tenantId && typeof userObj.tenantId !== 'string') {
      userObj.tenantId = userObj.tenantId.toString();
    }
    return userObj;
  }

  async login(user: {
    id?: string;
    _id?: unknown;
    userId?: string;
    email: string;
    role?: string;
    tenantId?: string;
    password?: string;
  }) {
    // If password is provided, validate user
    if (user.password) {
      // This is a direct login attempt
      const validatedUser = await this.validateUser(user.email, user.password);
      // Ensure role is present and correct
      if (!validatedUser.role) {
        // Fallback: if email matches platform admin, set PLATFORM_SUPER_ADMIN
        const platformAdminEmails = ['admin@example.com', 'anand@gmail.com'];
        if (platformAdminEmails.includes(validatedUser.email)) {
          validatedUser.role =
            require('../modules/users/role.types').Role.PLATFORM_SUPER_ADMIN;
        }
      }
      user = validatedUser as any; // Explicitly cast to any to avoid type error
    }
    let subject: string | null = user.id ?? user.userId ?? null;
    if (!subject && user._id && typeof user._id === 'object') {
      subject = objectIdToString(user._id);
    }
    // Ensure tenantId is a string (if present)
    let tenantIdStr: string | undefined = undefined;
    if (
      user.tenantId &&
      typeof user.tenantId === 'string' &&
      user.tenantId.trim() !== ''
    ) {
      tenantIdStr = user.tenantId;
      console.log('[LOGIN DEBUG] tenantId is a valid string:', tenantIdStr);
    } else if (
      user.tenantId &&
      typeof user.tenantId === 'object' &&
      (user.tenantId as any).toString
    ) {
      tenantIdStr = (user.tenantId as any).toString();
      console.log('[LOGIN DEBUG] tenantId converted from object:', tenantIdStr);
    } else {
      console.log(
        '[LOGIN DEBUG] tenantId is missing or invalid:',
        user.tenantId,
        'typeof:',
        typeof user.tenantId,
      );
    }

    // Enhanced Debug log for user object
    console.log('[LOGIN DEBUG] Received login payload:', user);
    console.log('[LOGIN DEBUG] Email:', user.email);
    console.log('[LOGIN DEBUG] Role:', user.role);
    console.log('[LOGIN DEBUG] TenantId:', user.tenantId);
    console.log('[LOGIN DEBUG] Password:', user.password ? '***' : undefined);
    if (user.password) {
      console.log('[LOGIN DEBUG] User after validation:', user);
    }
    // Print all users with this email for duplicate check
    try {
      const allUsers = await this.userModel.find({ email: user.email }).lean();
      console.log('[LOGIN DEBUG] All users with this email:', allUsers);
    } catch (err) {
      console.log(
        '[LOGIN DEBUG] Error fetching all users with this email:',
        err,
      );
    }
    // Always allow login for platform admin emails and roles
    const platformAdminEmails = ['admin@example.com', 'anand@gmail.com'];
    const isPlatformAdmin =
      user.role === 'PLATFORM_SUPER_ADMIN' ||
      user.role === 'PLATFORM_SUPERADMIN' ||
      user.role === 'platform_admin' ||
      user.role === 'PLATFORM_ADMIN_LEGACY';
    if (platformAdminEmails.includes(user.email) || isPlatformAdmin) {
      console.log(
        '[LOGIN DEBUG] Bypassing tenant check for platform admin:',
        user.email,
      );
    } else {
      if (!tenantIdStr || tenantIdStr.trim() === '') {
        console.log(
          '[LOGIN DEBUG] Tenant not found for user:',
          user.email,
          'Role:',
          user.role,
          'tenantIdStr:',
          tenantIdStr,
          'original tenantId:',
          user.tenantId,
        );
        throw new UnauthorizedException('Tenant not found');
      } else {
        console.log('[LOGIN DEBUG] TenantId present, proceeding:', tenantIdStr);
      }
    }

    const payload = {
      sub: subject,
      email: user.email,
      role: user.role,
      tenantId: tenantIdStr,
    };
    return {
      token: this.jwtService.sign(payload),
      user: {
        id: subject,
        email: user.email,
        name: (user as any).name ?? '',
        role: user.role,
        tenantId: tenantIdStr,
      },
    };
  }

  /**
   * Phase 2: Self-registration endpoint for 4-step tenant signup
   * Creates tenant + admin user with personal/company/compliance data
   */
  async registerTenant(dto: TenantRegisterDto) {
    const {
      personal,
      company,
      compliance,
      password,
      subdomain,
      planId,
      referralCode,
    } = dto;

    // 1. Check uniqueness: email, username, subdomain
    const normalizedEmail = personal.email.toLowerCase().trim();
    const existingEmail = await this.userModel
      .findOne({ email: normalizedEmail })
      .exec();
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    const existingUsername = await this.userModel
      .findOne({ username: personal.username })
      .exec();
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    const existingSubdomain = await this.tenantModel
      .findOne({ slug: subdomain })
      .exec();
    if (existingSubdomain) {
      throw new ConflictException('Subdomain already taken');
    }

    // Validate compliance
    if (!compliance.acceptedTerms || !compliance.acceptedPrivacy) {
      throw new BadRequestException(
        'You must accept Terms of Service and Privacy Policy',
      );
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create Tenant record
    const tenant = await this.tenantModel.create({
      name: company.companyName,
      slug: subdomain,
      domain: `${subdomain}.yourdomain.com`, // customize as needed
      companyName: company.companyName,
      companyDateOfBirth: company.companyDateOfBirth
        ? new Date(company.companyDateOfBirth)
        : undefined,
      companyEmail: company.companyEmail,
      companyPhone: company.companyPhone,
      companyAddress: company.companyAddress,
      planKey: planId || 'FREE',
      status: 'trialing',
      isActive: true,
      acceptedTerms: compliance.acceptedTerms,
      acceptedPrivacy: compliance.acceptedPrivacy,
      acceptedTermsAt: compliance.acceptedTerms ? new Date() : undefined,
      acceptedPrivacyAt: compliance.acceptedPrivacy ? new Date() : undefined,
      createdByPlatformOwner: false,
      skipPayment: false,
      referralCode,
    });

    // 4. Create Admin User linked to this tenant
    const user = await this.userModel.create({
      name: `${personal.firstName} ${personal.lastName}`,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'tenant_admin',
      tenantId: tenant._id,
      isActive: true,
      company: company.companyName,
      // Personal fields
      firstName: personal.firstName,
      secondName: personal.secondName,
      lastName: personal.lastName,
      dateOfBirth: personal.dateOfBirth
        ? new Date(personal.dateOfBirth)
        : undefined,
      username: personal.username,
      phone: personal.phone,
      homeAddress: personal.homeAddress,
      // Company user fields
      positionInCompany: company.positionInCompany,
      companyEmailForUser: company.companyEmailForUser,
      companyPhoneForUser: company.companyPhoneForUser,
      companyIdNumberForUser: company.companyIdNumberForUser,
    });

    // 5. Update tenant with owner user reference

    const tenantIdUpdate = objectIdToString(tenant._id);

    const userIdUpdate = objectIdToString(user._id);
    await this.tenantModel.findByIdAndUpdate(tenantIdUpdate, {
      createdByUserId: userIdUpdate,
    });

    // 6. Generate JWT for immediate login

    const userId = objectIdToString(user._id);

    const tenantIdStr = objectIdToString(tenant._id);
    const payload = {
      sub: userId,
      email: user.email,
      role: user.role,
      tenantId: tenantIdStr,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      tenant: {
        id: tenantIdStr,
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.domain,
      },
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Send email verification link
   */
  async sendVerificationEmail(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userModel.findOne({ email: normalizedEmail });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      return { message: 'Email is already verified' };
    }

    // Create verification token
    const token = await this.authTokenService.createToken(
      user._id,
      TokenType.EMAIL_VERIFICATION,
      48,
    );

    // Send email with verification link
    const frontendBaseUrl =
      process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendBaseUrl}/verify-email?token=${token}`;

    try {
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Verify Your Email Address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to Our Platform!</h2>
            <p>Hi ${user.name},</p>
            <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
            <div style="margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This link will expire in 48 hours. If you didn't create an account, please ignore this email.
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new BadRequestException(
        'Failed to send verification email. Please try again later.',
      );
    }

    return { message: 'Verification email sent successfully' };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const result = await this.authTokenService.verifyAndConsumeToken(
      token,
      TokenType.EMAIL_VERIFICATION,
    );

    if (!result.valid) {
      throw new BadRequestException(
        result.reason || 'Invalid verification token',
      );
    }

    // Update user's email verified status
    await this.userModel.findByIdAndUpdate(result.userId, {
      emailVerified: true,
    });

    return { message: 'Email verified successfully! You can now log in.' };
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.userModel.findOne({ email: normalizedEmail });

    // Don't reveal if user exists or not for security
    if (!user) {
      return {
        message:
          'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Create reset token
    const token = await this.authTokenService.createToken(
      user._id,
      TokenType.PASSWORD_RESET,
      2,
    ); // 2 hours

    // Send password reset email
    const frontendBaseUrl =
      process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendBaseUrl}/reset-password?token=${token}`;

    try {
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Reset Your Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hi ${user.name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="color: #666; word-break: break-all;">${resetUrl}</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              This link will expire in 2 hours. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new BadRequestException(
        'Failed to send password reset email. Please try again later.',
      );
    }

    return {
      message:
        'If an account with that email exists, a password reset link has been sent.',
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const result = await this.authTokenService.verifyAndConsumeToken(
      token,
      TokenType.PASSWORD_RESET,
    );

    if (!result.valid) {
      throw new BadRequestException(
        result.reason || 'Invalid or expired reset token',
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await this.userModel.findByIdAndUpdate(result.userId, {
      password: hashedPassword,
    });

    return {
      message:
        'Password reset successfully! You can now log in with your new password.',
    };
  }

  /**
   * Handle OAuth login (Google, GitHub, etc.)
   * Creates or finds user by provider info and returns JWT
   */
  async handleOAuthLogin(oauthProfile: {
    provider: string;
    providerId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    picture?: string;
  }): Promise<string> {
    // Find existing user by provider or email
    let user = await this.userModel.findOne({
      $or: [
        { [`oauth.${oauthProfile.provider}.id`]: oauthProfile.providerId },
        { email: oauthProfile.email },
      ],
    });

    if (!user) {
      // Create new user from OAuth profile
      user = await this.userModel.create({
        email: oauthProfile.email,
        firstName:
          oauthProfile.firstName || oauthProfile.displayName?.split(' ')[0],
        lastName:
          oauthProfile.lastName || oauthProfile.displayName?.split(' ')[1],
        role: Role.USER,
        emailVerified: true, // Trust OAuth provider verification
        oauth: {
          [oauthProfile.provider]: {
            id: oauthProfile.providerId,
            picture: oauthProfile.picture,
          },
        },
      });
    } else if (!user.oauth?.[oauthProfile.provider]) {
      // Link OAuth provider to existing user
      await this.userModel.findByIdAndUpdate(user._id, {
        $set: {
          [`oauth.${oauthProfile.provider}`]: {
            id: oauthProfile.providerId,
            picture: oauthProfile.picture,
          },
        },
      });
    }

    // Generate JWT
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId?.toString(),
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Minimal tenant + admin registration flow (used by the simple frontend Register page).
   */
  async registerSimple(dto: SimpleRegisterDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    const existingEmail = await this.userModel
      .findOne({ email: normalizedEmail })
      .exec();

    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    const baseSlug = slugify(dto.tenantName, {
      lower: true,
      strict: true,
      trim: true,
    });

    const safeBase = baseSlug && baseSlug.length > 0 ? baseSlug : 'tenant';
    let slug = safeBase;

    for (let i = 0; i < 5; i += 1) {
      const existing = await this.tenantModel.findOne({ slug }).exec();
      if (!existing) break;
      slug = `${safeBase}-${i + 1}`;
    }

    const stillExists = await this.tenantModel.findOne({ slug }).exec();
    if (stillExists) {
      slug = `${safeBase}-${crypto.randomBytes(2).toString('hex')}`;
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const tenant = await this.tenantModel.create({
      name: dto.tenantName,
      slug,
      domain: `${slug}.yourdomain.com`,
      companyName: dto.tenantName,
      planKey: 'FREE',
      status: 'trialing',
      isActive: true,
      acceptedTerms: false,
      acceptedPrivacy: false,
      createdByPlatformOwner: false,
      skipPayment: false,
    });

    const user = await this.userModel.create({
      name: `${dto.firstName} ${dto.lastName}`.trim(),
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: normalizedEmail,
      password: hashedPassword,
      role: Role.TENANT_ADMIN_LEGACY,
      tenantId: tenant._id,
      isActive: true,
      emailVerified: false,
    });

    await this.tenantModel
      .findByIdAndUpdate(tenant._id, { createdByUserId: user._id })
      .exec();

    const userId = objectIdToString(user._id);
    const tenantIdStr = objectIdToString(tenant._id);

    const payload = {
      sub: userId,
      email: user.email,
      role: user.role,
      tenantId: tenantIdStr,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      tenant: {
        id: tenantIdStr,
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.domain,
      },
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async verifyAccessToken(token: string): Promise<{
    sub?: string;
    email?: string;
    role?: string;
    tenantId?: string;
  }> {
    return this.jwtService.verify(token);
  }
}
