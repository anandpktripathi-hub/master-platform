import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tenant, TenantDocument } from '../../database/schemas/tenant.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { PlanKey } from '../../config/plans.config';
import { ManualCreateTenantDto } from './dto/manual-create-tenant.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async createTenant(
    name: string,
    createdByUserId: Types.ObjectId,
    planKey: PlanKey = 'FREE',
  ) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const tenant = new this.tenantModel({
      name,
      slug,
      companyName: name,
      createdByUserId,
      planKey,
      status: 'trialing',
      isActive: true,
    });
    return tenant.save();
  }

  async getCurrentTenant(tenantId: string) {
    return this.tenantModel.findById(tenantId).lean();
  }

  /**
   * Phase 3: Platform admin manually creates a tenant
   * Allows optional password, sets createdByPlatformOwner flag
   */
  async manualCreateTenant(
    dto: ManualCreateTenantDto,
    createdByAdminId: string,
  ) {
    const {
      personal,
      company,
      compliance,
      password,
      subdomain,
      planId,
      skipPayment,
      sendInviteEmail,
    } = dto;

    // 1. Check uniqueness
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
      throw new BadRequestException('Compliance must be accepted');
    }

    // 2. Generate password if not provided
    const tempPassword = password || crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // 3. Create Tenant record (marked as platform-created)
    const tenant = await this.tenantModel.create({
      name: company.companyName,
      slug: subdomain,
      domain: `${subdomain}.yourdomain.com`,
      companyName: company.companyName,
      companyDateOfBirth: company.companyDateOfBirth
        ? new Date(company.companyDateOfBirth)
        : undefined,
      companyEmail: company.companyEmail,
      companyPhone: company.companyPhone,
      companyAddress: company.companyAddress,
      planKey: planId || 'FREE',
      status: skipPayment ? 'active' : 'pending_payment',
      isActive: true,
      acceptedTerms: compliance.acceptedTerms,
      acceptedPrivacy: compliance.acceptedPrivacy,
      acceptedTermsAt: compliance.acceptedTerms ? new Date() : undefined,
      acceptedPrivacyAt: compliance.acceptedPrivacy ? new Date() : undefined,
      createdByPlatformOwner: true,
      skipPayment: skipPayment || false,
      createdByUserId: new Types.ObjectId(createdByAdminId),
    });

    // 4. Create Admin User for this tenant
    const user = await this.userModel.create({
      name: `${personal.firstName} ${personal.lastName}`,
      email: personal.email,
      password: hashedPassword,
      role: 'tenant_admin',
      tenantId: tenant._id,
      isActive: true,
      company: company.companyName,
      firstName: personal.firstName,
      secondName: personal.secondName,
      lastName: personal.lastName,
      dateOfBirth: personal.dateOfBirth
        ? new Date(personal.dateOfBirth)
        : undefined,
      username: personal.username,
      phone: personal.phone,
      homeAddress: personal.homeAddress,
      positionInCompany: company.positionInCompany,
      companyEmailForUser: company.companyEmailForUser,
      companyPhoneForUser: company.companyPhoneForUser,
      companyIdNumberForUser: company.companyIdNumberForUser,
    });

    // 5. Placeholder for invitation email
    if (sendInviteEmail && !password) {
      // TODO: Implement email service to send set-password link
      // await this.emailService.sendSetPasswordInvite(user.email, tempPassword);
      console.log(
        `[INVITE PLACEHOLDER] Send invite to ${user.email} with temp password: ${tempPassword}`,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const tenantIdStr = tenant._id.toString();
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const userIdStr = user._id.toString();

    return {
      success: true,
      tenant: {
        id: tenantIdStr,
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.domain,
        status: tenant.status,
      },
      user: {
        id: userIdStr,
        email: user.email,
        name: user.name,
        role: user.role,
        username: user.username,
      },
      temporaryPassword: !password ? tempPassword : undefined,
      inviteSent: sendInviteEmail && !password,
    };
  }
}
