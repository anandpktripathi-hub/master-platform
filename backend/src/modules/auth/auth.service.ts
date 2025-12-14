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
import { User, UserDocument } from '../../database/schemas/user.schema';
import { Tenant, TenantDocument } from '../../database/schemas/tenant.schema';
import { TenantRegisterDto } from './dto/tenant-register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<UserDocument, 'password'>> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userObj = user.toObject() as UserDocument & { password?: string };
    delete userObj.password;
    return userObj;
  }

  login(user: {
    id?: string;
    _id?: unknown;
    userId?: string;
    email: string;
    role?: string;
    tenantId?: string;
    password?: string;
  }) {
    let subject: string | null = user.id ?? user.userId ?? null;
    if (!subject && user._id && typeof user._id === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      subject = String(user._id);
    }
    const payload = {
      sub: subject,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  /**
   * Phase 2: Self-registration endpoint for 4-step tenant signup
   * Creates tenant + admin user with personal/company/compliance data
   */
  async registerTenant(dto: TenantRegisterDto) {
    const { personal, company, compliance, password, subdomain, planId } = dto;

    // 1. Check uniqueness: email, username, subdomain
    const existingEmail = await this.userModel
      .findOne({ email: personal.email })
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
    });

    // 4. Create Admin User linked to this tenant
    const user = await this.userModel.create({
      name: `${personal.firstName} ${personal.lastName}`,
      email: personal.email,
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
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const tenantIdUpdate = tenant._id.toString();
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const userIdUpdate = user._id.toString();
    await this.tenantModel.findByIdAndUpdate(tenantIdUpdate, {
      createdByUserId: userIdUpdate,
    });

    // 6. Generate JWT for immediate login
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const userId = user._id.toString();
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const tenantIdStr = tenant._id.toString();
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
}
