import {
  Injectable,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tenant, TenantDocument } from '../../database/schemas/tenant.schema';
import { User, UserDocument } from '../../database/schemas/user.schema';
import {
  BusinessReview,
  BusinessReviewDocument,
} from '../../database/schemas/business-review.schema';
import { PlanKey } from '../../config/plans.config';
import { ManualCreateTenantDto } from './dto/manual-create-tenant.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { objectIdToString } from '../../utils/objectIdToString';
import { Role } from '../users/role.types';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    @InjectModel(Tenant.name)
    private readonly tenantModel: Model<TenantDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(BusinessReview.name)
    private readonly reviewModel: Model<BusinessReviewDocument>,
  ) {}

  /**
   * Resolve a reasonable billing/contact email address for a tenant.
   *
   * Priority:
   * 1. Tenant.companyEmail
   * 2. Tenant.contactEmailPublic
   * 3. Created-by user email
   * 4. First active OWNER/ADMIN/TENANT_ADMIN_LEGACY user for the tenant
   * 5. Any active user for the tenant
   */
  async getTenantBillingEmail(tenantId: string): Promise<string | null> {
    if (!tenantId) {
      return null;
    }

    try {
      const tenantObjectId = new Types.ObjectId(tenantId);
      const tenant = await this.tenantModel.findById(tenantObjectId).lean();

      if (!tenant) {
        return null;
      }

      if (tenant.companyEmail) {
        return String(tenant.companyEmail).trim();
      }

      if (tenant.contactEmailPublic) {
        return String(tenant.contactEmailPublic).trim();
      }

      if (tenant.createdByUserId) {
        const creator = await this.userModel
          .findById(tenant.createdByUserId)
          .lean();
        if (creator?.email) {
          return String(creator.email).trim();
        }
      }

      const adminRoles = [Role.OWNER, Role.ADMIN, Role.TENANT_ADMIN_LEGACY];

      const adminUser = await this.userModel
        .findOne({
          tenantId: tenantObjectId,
          role: { $in: adminRoles },
          isActive: true,
        })
        .sort({ createdAt: 1 })
        .lean();

      if (adminUser?.email) {
        return String(adminUser.email).trim();
      }

      const anyUser = await this.userModel
        .findOne({ tenantId: tenantObjectId, isActive: true })
        .sort({ createdAt: 1 })
        .lean();

      if (anyUser?.email) {
        return String(anyUser.email).trim();
      }

      return null;
    } catch (error) {
      this.logger.error(
        `Failed to resolve tenant billing email for tenantId=${tenantId}`,
        error as any,
      );
      return null;
    }
  }

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

  private normalizeHost(hostRaw: string): string {
    const host = String(hostRaw || '')
      .trim()
      .toLowerCase();
    // strip port if present
    return host.includes(':') ? host.split(':')[0] : host;
  }

  async resolveTenantById(tenantId: string): Promise<TenantDocument | null> {
    if (!tenantId) return null;
    try {
      if (!Types.ObjectId.isValid(tenantId)) return null;
      return await this.tenantModel.findById(tenantId).lean<TenantDocument>();
    } catch (error) {
      this.logger.warn(`Failed to resolve tenant by id tenantId=${tenantId}`);
      return null;
    }
  }

  async resolveTenantByHost(hostRaw: string): Promise<TenantDocument | null> {
    const host = this.normalizeHost(hostRaw);
    if (!host) return null;

    try {
      // 1) Exact domain match
      const byDomain = await this.tenantModel
        .findOne({ domain: host, isActive: true })
        .lean<TenantDocument>();
      if (byDomain) return byDomain;

      // 2) Custom domains array
      const byCustom = await this.tenantModel
        .findOne({ customDomains: host, isActive: true })
        .lean<TenantDocument>();
      if (byCustom) return byCustom;

      // 3) Subdomain slug match for `${slug}.${PLATFORM_PRIMARY_DOMAIN}`
      const primary = process.env.PLATFORM_PRIMARY_DOMAIN
        ? this.normalizeHost(process.env.PLATFORM_PRIMARY_DOMAIN)
        : '';
      if (primary && host.endsWith(`.${primary}`)) {
        const slug = host.slice(0, -1 * (primary.length + 1));
        if (slug) {
          const bySlug = await this.tenantModel
            .findOne({ slug, isActive: true })
            .lean<TenantDocument>();
          if (bySlug) return bySlug;
        }
      }

      return null;
    } catch (error) {
      this.logger.warn(`Failed to resolve tenant by host host=${host}`);
      return null;
    }
  }

  async getCurrentTenant(tenantId: string) {
    return this.tenantModel.findById(tenantId).lean();
  }

  async updateTenantPublicProfile(
    tenantId: string,
    payload: Partial<TenantDocument>,
  ) {
    const updated = await this.tenantModel
      .findByIdAndUpdate(tenantId, payload, { new: true })
      .lean();
    if (!updated) {
      throw new BadRequestException('Tenant not found');
    }
    return updated;
  }

  async getPublicBusinessBySlug(slug: string) {
    const tenant = await this.tenantModel
      .findOne({
        slug,
        isActive: true,
        isListedInDirectory: true,
        directoryVisibility: 'PUBLIC',
      })
      .lean();
    if (!tenant) {
      throw new BadRequestException('Business not found');
    }
    return tenant;
  }

  async listPublicBusinesses(filter: {
    q?: string;
    category?: string;
    city?: string;
    country?: string;
    tag?: string;
    priceTier?: 'LOW' | 'MEDIUM' | 'HIGH';
    minRating?: number;
  }) {
    const query: Record<string, unknown> = {
      isActive: true,
      isListedInDirectory: true,
      directoryVisibility: 'PUBLIC',
    };

    if (filter.category) {
      query.categories = filter.category;
    }
    if (filter.city) {
      query.city = filter.city;
    }
    if (filter.country) {
      query.country = filter.country;
    }
    if (filter.tag) {
      query.tags = filter.tag;
    }
    if (filter.priceTier) {
      query.priceTier = filter.priceTier;
    }
    if (filter.minRating !== undefined) {
      query.avgRating = { $gte: filter.minRating };
    }
    if (filter.q) {
      query.$or = [
        { name: new RegExp(filter.q, 'i') },
        { publicName: new RegExp(filter.q, 'i') },
        { shortDescription: new RegExp(filter.q, 'i') },
        { tags: new RegExp(filter.q, 'i') },
      ];
    }

    return this.tenantModel
      .find(query)
      .select(
        'name publicName slug tagline shortDescription logoUrl city country categories tags planKey isActive priceTier avgRating reviewCount',
      )
      .lean();
  }

  async listBusinessReviews(tenantId: Types.ObjectId) {
    return this.reviewModel
      .find({ tenantId, status: 'PUBLISHED' })
      .sort({ createdAt: -1 })
      .lean();
  }

  async addBusinessReview(
    tenantId: Types.ObjectId,
    userId: Types.ObjectId,
    rating: number,
    comment?: string,
  ) {
    await this.reviewModel.create({
      tenantId,
      userId,
      rating,
      comment,
      status: 'PUBLISHED',
    });

    const agg = await this.reviewModel
      .aggregate([
        { $match: { tenantId, status: 'PUBLISHED' } },
        {
          $group: {
            _id: '$tenantId',
            avgRating: { $avg: '$rating' },
            reviewCount: { $sum: 1 },
          },
        },
      ])
      .exec();

    const { avgRating = 0, reviewCount = 0 } = agg[0] || {};

    await this.tenantModel.updateOne(
      { _id: tenantId },
      { $set: { avgRating, reviewCount } },
    );
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

    const tenantIdStr = objectIdToString(tenant._id);

    const userIdStr = objectIdToString(user._id);

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
