import { Injectable, ConflictException, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole, UserStatus } from '../schemas/user.schema';
import { Tenant, TenantDocument, TenantStatus } from '../schemas/tenant.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, tenantName } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create tenant slug from tenant name
    const slug = tenantName.toLowerCase().replace(/\s+/g, '-');

    // Check if tenant slug already exists
    const existingTenant = await this.tenantModel.findOne({ slug });
    if (existingTenant) {
      throw new ConflictException('A tenant with this name already exists');
    }

    // Create new tenant
    const tenant = new this.tenantModel({
      name: tenantName,
      slug,
      status: TenantStatus.TRIAL,
      isActive: true,
      subscriptionTier: 'trial',
    });
    await tenant.save();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user as tenant owner
    const user = new this.userModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      tenant: tenant._id,
      role: UserRole.TENANT_OWNER,
      status: UserStatus.ACTIVE,
      isActive: true,
    });
    await user.save();

    // Generate JWT token
    const payload = { 
      sub: user._id, 
      email: user.email, 
      tenant: tenant._id,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: this.sanitizeUser(user),
      tenant: this.sanitizeTenant(tenant),
      accessToken,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email and populate tenant
    const user = await this.userModel.findOne({ email }).populate('tenant');
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { 
      sub: user._id, 
      email: user.email, 
      tenant: user.tenant,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: this.sanitizeUser(user),
      tenant: user.tenant ? this.sanitizeTenant(user.tenant as any) : null,
      accessToken,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    if (user.status !== UserStatus.ACTIVE) {
      return null;
    }

    return user;
  }

  async getUserById(userId: string) {
    const user = await this.userModel.findById(userId).populate('tenant');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user: this.sanitizeUser(user),
      tenant: user.tenant ? this.sanitizeTenant(user.tenant as any) : null,
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  async requestPasswordReset(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return { message: 'If a user with that email exists, a password reset link has been sent' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token and expiry (1 hour from now)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // TODO: Send email with reset link containing resetToken
    // For now, just return the token (in production, send via email)
    return { 
      message: 'If a user with that email exists, a password reset link has been sent',
      resetToken, // Remove this in production
    };
  }

  async resetPassword(resetToken: string, newPassword: string) {
    // Hash the provided token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Find user with valid reset token
    const user = await this.userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() }, // Token not expired
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password has been reset successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).populate('tenant');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user: this.sanitizeUser(user),
      tenant: user.tenant ? this.sanitizeTenant(user.tenant as any) : null,
    };
  }

  private sanitizeUser(user: any) {
    const { password, resetPasswordToken, resetPasswordExpires, ...sanitized } = user.toObject();
    return sanitized;
  }

  private sanitizeTenant(tenant: any) {
    return tenant.toObject();
  }
}
