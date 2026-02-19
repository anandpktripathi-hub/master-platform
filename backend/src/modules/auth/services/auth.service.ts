import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../../database/schemas/user.schema';
import { AuthTokenService } from './auth-token.service';
import { TokenType } from '../schemas/auth-token.schema';
import { EmailService } from '../../settings/email.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../../users/role.types';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly authTokenService: AuthTokenService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user
   */
  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<{ user: User; message: string }> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      emailVerified: false,
      role: Role.USER,
      isActive: true,
    });

    // Send verification email
    await this.sendVerificationEmail(user.email);

    return {
      user,
      message:
        'Registration successful. Please check your email to verify your account.',
    };
  }

  /**
   * Login user
   */
  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; user: Partial<User> }> {
    // Find user
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException(
        'Your account has been deactivated. Please contact support.',
      );
    }

    // Generate JWT token
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
    const accessToken = this.jwtService.sign(payload);

    // Return sanitized user
    const sanitizedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      tenantId: user.tenantId,
    };

    return { accessToken, user: sanitizedUser };
  }

  /**
   * Send email verification link
   */
  async sendVerificationEmail(email: string): Promise<{ message: string }> {
    const user = await this.userModel.findOne({ email });
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
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

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
    const user = await this.userModel.findOne({ email });

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
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;

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
}
