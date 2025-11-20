import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole, UserStatus } from '../schemas/user.schema';
import { Tenant, TenantDocument, TenantStatus } from '../schemas/tenant.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, companyName, companySlug } = registerDto;

    // Check if user exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Check if tenant slug exists
    const existingTenant = await this.tenantModel.findOne({ slug: companySlug });
    if (existingTenant) {
      throw new ConflictException('Company slug already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create tenant first
    const tenant = await this.tenantModel.create({
      slug: companySlug,
      name: companyName,
      email: email,
      status: TenantStatus.TRIAL,
      ownerId: null, // Will update after user creation
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
    });

    // Create user with tenant reference
    const user = await this.userModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: UserRole.TENANT_OWNER,
      status: UserStatus.ACTIVE,
      tenantId: tenant._id,
    });

    // Update tenant with owner ID
    await this.tenantModel.findByIdAndUpdate(tenant._id, { ownerId: user._id });

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      message: 'Registration successful',
      user: this.sanitizeUser(user),
      tenant: this.sanitizeTenant(tenant),
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user with tenant info
    const user = await this.userModel.findOne({ email }).populate('tenantId');
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Update last login
    await this.userModel.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    // Generate token
    const token = this.generateToken(user);

    return {
      message: 'Login successful',
      user: this.sanitizeUser(user),
      tenant: user.tenantId ? this.sanitizeTenant(user.tenantId as any) : null,
      token,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async getUserById(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId).populate('tenantId');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  generateToken(user: UserDocument): string {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId?.toString(),
    };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: any) {
    const { password, emailVerificationToken, passwordResetToken, twoFactorSecret, ...sanitized } = user.toObject();
    return sanitized;
  }

  private sanitizeTenant(tenant: any) {
    if (!tenant) return null;
    const tenantObj = tenant.toObject ? tenant.toObject() : tenant;
    return tenantObj;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.userModel.findByIdAndUpdate(userId, { password: hashedPassword });

    return { message: 'Password changed successfully' };
  }

  async requestPasswordReset(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      // Don't reveal if user exists
      return { message: 'If email exists, password reset link has been sent' };
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await this.userModel.findByIdAndUpdate(user._id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    // TODO: Send email with reset link
    // For now, return token (in production, send via email)
    return {
      message: 'Password reset token generated',
      resetToken, // Remove this in production
    };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    const user = await this.userModel.findOne({
      passwordResetToken: resetToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await this.userModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    return { message: 'Password reset successful' };
  }
}
