import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../schemas/user.schema';
import { Tenant } from '../schemas/tenant.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Tenant') private tenantModel: Model<Tenant>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, tenantName } = registerDto;

    const existingUser = await this.userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const slug = tenantName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const tenant = await this.tenantModel.create({
      name: tenantName,
      slug,
      status: 'TRIAL',
      subscriptionTier: 'trial',
      isActive: true,
    });

    const user = await this.userModel.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      tenant: tenant._id,
      role: 'TENANT_OWNER',
      status: 'ACTIVE',
      isActive: true,
    });

    const payload = { sub: user._id, email: user.email, tenantId: tenant._id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.emailService.sendWelcomeEmail(user.email, firstName);

    return {
      user: this.sanitizeUser(user),
      tenant: { id: tenant._id, name: tenant.name, slug: tenant.slug },
      accessToken,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email: email.toLowerCase() }).populate('tenant');
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    user.lastLoginAt = new Date();
    await user.save();

    const payload = { sub: user._id, email: user.email, tenantId: (user.tenant as any)._id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      user: this.sanitizeUser(user),
      tenant: user.tenant,
      accessToken,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.userModel.findById(userId).populate('tenant');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      user: this.sanitizeUser(user),
      tenant: user.tenant,
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await this.emailService.sendPasswordChangedEmail(user.email, user.firstName);

    return { message: 'Password changed successfully' };
  }

  async requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto) {
    const { email } = requestPasswordResetDto;

    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return { message: 'If email exists, reset link has been sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    await this.emailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);

    return { message: 'If email exists, reset link has been sent' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    await this.emailService.sendPasswordResetConfirmationEmail(user.email, user.firstName);

    return { message: 'Password reset successful' };
  }

  private sanitizeUser(user: any) {
    const { password, resetPasswordToken, resetPasswordExpires, ...sanitized } = user.toObject();
    return sanitized;
  }
}
