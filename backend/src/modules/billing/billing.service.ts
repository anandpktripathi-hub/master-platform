import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Billing,
  BillingDocument,
} from '../../database/schemas/billing.schema';
import { BillingNotificationService } from './billing-notification.service';
import { TenantsService } from '../tenants/tenants.service';
import { PackageService } from '../packages/services/package.service';
import type { TenantPackage } from '../../database/schemas/tenant-package.schema';
import type { Package } from '../../database/schemas/package.schema';

type CustomDomainsEntitlementOptionsV1 = {
  used?: number;
  now?: Date;
};

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  /**
   * v1 fallback mapping used only when Package feature/limits are missing.
   * Primary source of truth should be `Package.featureSet` + `Package.limits`.
   */
  private readonly CUSTOM_DOMAINS_FALLBACK_LIMITS_V1: Record<
    string,
    { allow: boolean; max: number }
  > = {
    free: { allow: false, max: 0 },
    pro: { allow: true, max: 3 },
    enterprise: { allow: true, max: 20 },
  };

  constructor(
    @InjectModel(Billing.name) private billingModel: Model<BillingDocument>,
    private readonly billingNotifications: BillingNotificationService,
    private readonly tenantsService: TenantsService,
    private readonly packageService: PackageService,
  ) {}

  private isTenantPackageActiveNow(
    tenantPackage: TenantPackage,
    now: Date,
  ): boolean {
    const rawStatus = (tenantPackage as any).status as string | undefined;
    if (rawStatus === 'trial') {
      const trialEndsAt = (tenantPackage as any).trialEndsAt as Date | undefined;
      return !trialEndsAt || trialEndsAt.getTime() > now.getTime();
    }

    if (rawStatus === 'active') {
      const expiresAt = (tenantPackage as any).expiresAt as Date | undefined;
      return !expiresAt || expiresAt.getTime() > now.getTime();
    }

    return false;
  }

  private resolveCustomDomainsLimitsV1(pkg?: Package): {
    allowCustomDomains: boolean;
    maxAllowed: number;
  } {
    const pkgAllow = pkg?.featureSet?.allowCustomDomain;
    const pkgMax = (pkg as any)?.limits?.maxCustomDomains;

    // Prefer package configuration when present.
    if (typeof pkgAllow === 'boolean' && typeof pkgMax === 'number') {
      const maxAllowed = Number.isFinite(pkgMax) ? Math.max(0, Math.floor(pkgMax)) : 0;
      return {
        allowCustomDomains: pkgAllow,
        maxAllowed: pkgAllow ? maxAllowed : 0,
      };
    }

    // Fallback for legacy FREE/PRO/ENTERPRISE by package name.
    const planKey = (pkg?.name || '').trim().toLowerCase();
    const fallback = this.CUSTOM_DOMAINS_FALLBACK_LIMITS_V1[planKey];
    if (fallback) {
      return {
        allowCustomDomains: fallback.allow,
        maxAllowed: fallback.allow ? fallback.max : 0,
      };
    }

    return { allowCustomDomains: false, maxAllowed: 0 };
  }

  /**
   * v1 assertion helper used by other modules.
   * Centralizes custom-domain entitlement checks on subscription state.
   */
  async assertTenantAllowedCustomDomains(
    tenantId: string,
    options: CustomDomainsEntitlementOptionsV1 = {},
  ): Promise<void> {
    const now = options.now || new Date();
    const tenantPackage = await this.packageService.getTenantPackage(tenantId);
    if (!tenantPackage) {
      throw new BadRequestException('Tenant has no active package');
    }

    const activeNow = this.isTenantPackageActiveNow(tenantPackage as any, now);
    if (!activeNow) {
      throw new BadRequestException('Tenant has no active package');
    }

    const pkg = (tenantPackage as any).packageId as Package | undefined;
    const { allowCustomDomains, maxAllowed } = this.resolveCustomDomainsLimitsV1(pkg);

    if (!allowCustomDomains || maxAllowed === 0) {
      throw new BadRequestException('Your plan does not allow custom domains');
    }

    const used = (() => {
      const overrideUsed = options.used;
      if (typeof overrideUsed === 'number' && Number.isFinite(overrideUsed)) {
        return Math.max(0, Math.floor(overrideUsed));
      }
      const raw = (tenantPackage as any).usageCounters?.customDomains;
      return typeof raw === 'number' && Number.isFinite(raw)
        ? Math.max(0, Math.floor(raw))
        : 0;
    })();

    if (used >= maxAllowed) {
      throw new BadRequestException(
        `You have reached the limit of ${maxAllowed} custom domains. Please upgrade.`,
      );
    }
  }

  async findAll(tenantId: string): Promise<Billing[]> {
    try {
      this.logger.log(`Fetching all billing records for tenant: ${tenantId}`);
      return await this.billingModel.find({ tenantId }).exec();
    } catch (error) {
      this.logger.error(
        `Error fetching billing records for tenant ${tenantId}:`,
        error,
      );
      throw new InternalServerErrorException('Failed to fetch billing records');
    }
  }

  async findOne(id: string): Promise<Billing | null> {
    try {
      this.logger.log(`Fetching billing record with id: ${id}`);
      const billing = await this.billingModel.findById(id).exec();
      if (!billing) {
        this.logger.warn(`Billing record not found: ${id}`);
        throw new NotFoundException(`Billing record with id ${id} not found`);
      }
      return billing;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error fetching billing record ${id}:`, error);
      throw new InternalServerErrorException('Failed to fetch billing record');
    }
  }

  async create(createBillingDto: Billing, tenantId: string): Promise<Billing> {
    try {
      this.logger.log(`Creating billing record for tenant: ${tenantId}`);
      const createdBilling = new this.billingModel({
        ...createBillingDto,
        tenantId,
      });
      const saved = await createdBilling.save();

      // Fire invoice-created notification if email is configured.
      // Note: Billing schema stores amount in major units; convert to cents for consistency.
      await this.billingNotifications
        .sendInvoiceCreatedEmail({
          to: await this.resolveTenantBillingEmail(tenantId),
          tenantId,
          invoiceNumber: saved._id.toString(),
          amount: Math.round(saved.amount * 100),
          currency: saved.currency,
        })
        .catch((err) =>
          this.logger.error('Failed to send billing invoice notification', err),
        );

      return saved;
    } catch (error) {
      this.logger.error(
        `Error creating billing record for tenant ${tenantId}:`,
        error,
      );
      throw new InternalServerErrorException('Failed to create billing record');
    }
  }

  private async resolveTenantBillingEmail(tenantId: string): Promise<string> {
    try {
      const email = await this.tenantsService.getTenantBillingEmail(tenantId);
      return email || 'billing-notifications@platform.local';
    } catch (error) {
      this.logger.error(
        `Error resolving tenant billing email for tenant ${tenantId}`,
        error as any,
      );
      return 'billing-notifications@platform.local';
    }
  }

  async update(
    id: string,
    updateBillingDto: Billing,
    tenantId: string,
  ): Promise<Billing | null> {
    try {
      this.logger.log(`Updating billing record ${id} for tenant: ${tenantId}`);
      const updated = await this.billingModel
        .findByIdAndUpdate(id, { ...updateBillingDto, tenantId }, { new: true })
        .exec();
      if (!updated) {
        this.logger.warn(`Billing record not found for update: ${id}`);
        throw new NotFoundException(`Billing record with id ${id} not found`);
      }
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating billing record ${id}:`, error);
      throw new InternalServerErrorException('Failed to update billing record');
    }
  }

  async remove(id: string) {
    try {
      this.logger.log(`Removing billing record: ${id}`);
      const deleted = await this.billingModel.findByIdAndDelete(id).exec();
      if (!deleted) {
        this.logger.warn(`Billing record not found for deletion: ${id}`);
        throw new NotFoundException(`Billing record with id ${id} not found`);
      }
      return deleted;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error removing billing record ${id}:`, error);
      throw new InternalServerErrorException('Failed to remove billing record');
    }
  }

  /**
   * PLATFORM ADMIN ENDPOINTS
   */

  async findAllForAdmin(filter?: {
    tenantId?: string;
    status?: string;
    from?: Date;
    to?: Date;
  }): Promise<Billing[]> {
    try {
      const query: Record<string, any> = {};
      if (filter?.tenantId) {
        query.tenantId = filter.tenantId;
      }
      if (filter?.status) {
        query.status = filter.status;
      }
      if (filter?.from || filter?.to) {
        query.createdAt = {};
        if (filter.from) query.createdAt.$gte = filter.from;
        if (filter.to) query.createdAt.$lte = filter.to;
      }

      return await this.billingModel
        .find(query)
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      this.logger.error('Error fetching billing records for admin:', error);
      throw new InternalServerErrorException('Failed to fetch billing records');
    }
  }

  async createForTenant(
    createBillingDto: Omit<Billing, 'tenantId'>,
    tenantId: string,
  ): Promise<Billing> {
    return this.create(createBillingDto as Billing, tenantId);
  }

  async updateForAdmin(
    id: string,
    update: Partial<Pick<Billing, 'amount' | 'currency' | 'status'>>,
  ): Promise<Billing> {
    try {
      const existing = await this.billingModel.findById(id).exec();
      if (!existing) {
        throw new NotFoundException(`Billing record with id ${id} not found`);
      }

      if (typeof update.amount === 'number') existing.amount = update.amount;
      if (typeof update.currency === 'string') existing.currency = update.currency;
      if (typeof update.status === 'string') existing.status = update.status;

      return await existing.save();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error updating billing record ${id} for admin:`, error);
      throw new InternalServerErrorException('Failed to update billing record');
    }
  }

  async removeForAdmin(id: string) {
    return this.remove(id);
  }
}
