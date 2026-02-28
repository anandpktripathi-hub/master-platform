import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import {
  Package,
  FeatureSet,
  PackageLimits,
} from '../../../database/schemas/package.schema';
import {
  TenantPackage,
  UsageCounters,
  TenantPackageDocument,
} from '../../../database/schemas/tenant-package.schema';
import { Tenant } from '../../../database/schemas/tenant.schema';
import { AuditLogService } from '../../../services/audit-log.service';
import { Optional } from '@nestjs/common';
import type { BillingNotificationService } from '../../billing/billing-notification.service';
import type { TenantsService } from '../../tenants/tenants.service';
import type {
  AssignPackageDto,
  CreatePackageDto,
  UpdatePackageDto,
} from '../dto/package.dto';
// import { PaymentGatewayService } from '../../payments/services/payment-gateway.service';
// import { PaymentLogService } from '../../payments/services/payment-log.service';

@Injectable()
export class PackageService {
  private readonly logger = new Logger(PackageService.name);

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (typeof value !== 'string' || !Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }
    return new Types.ObjectId(value);
  }

  private normalizeLimit(raw: unknown, defaultValue = 50, max = 100): number {
    const n = typeof raw === 'number' ? raw : Number.NaN;
    if (!Number.isFinite(n)) return defaultValue;
    const value = Math.floor(n);
    if (value <= 0) return defaultValue;
    return Math.min(value, max);
  }

  private normalizeSkip(raw: unknown): number {
    const n = typeof raw === 'number' ? raw : Number.NaN;
    if (!Number.isFinite(n)) return 0;
    const value = Math.floor(n);
    return value < 0 ? 0 : value;
  }

  constructor(
    @InjectModel(Package.name) private packageModel: Model<Package>,
    @InjectModel(TenantPackage.name)
    private tenantPackageModel: Model<TenantPackage>,
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
    private auditLogService: AuditLogService,
    // Payment services removed to break circular dependency

    // Setter injection for payment services

    // Example usage: pass payment services as parameters where needed
    // update methods like below:
    // async someMethod(..., paymentGatewayService: PaymentGatewayService, paymentLogService: PaymentLogService) { ... }
  ) {}

  /**
   * Create a new package
   */
  async createPackage(
    createDto: CreatePackageDto,
    userId?: string,
  ): Promise<Package> {
    // Validate unique name
    const exists = await this.packageModel.findOne({ name: createDto.name });

    if (exists) {
      throw new ConflictException(
        `Package named '${createDto.name}' already exists`,
      );
    }

    // Validate feature and limit keys
    this.validateFeatureSet(createDto.featureSet);
    this.validateLimits(createDto.limits);

    const pkg = new this.packageModel({
      name: createDto.name,
      description: createDto.description,
      price: createDto.price,
      billingCycle: createDto.billingCycle,
      trialDays: createDto.trialDays || 0,
      isActive: true,
      featureSet: createDto.featureSet,
      limits: createDto.limits,
      order: createDto.order || 999,
      expiryWarningDays:
        typeof createDto.expiryWarningDays === 'number' &&
        createDto.expiryWarningDays > 0
          ? createDto.expiryWarningDays
          : undefined,
      createdBy: userId ? new Types.ObjectId(userId) : undefined,
    });

    const saved = await pkg.save();

    // Audit log
    await this.auditLogService.log({
      actorId: userId,
      action: 'package_created',
      resourceType: 'Package',
      resourceId: saved._id.toString(),
      after: saved.toObject() as unknown as Record<string, unknown>,
      status: 'success',
    });

    this.logger.log(`Created package '${createDto.name}'`);
    return saved;
  }

  /**
   * Update a package
   */
  async updatePackage(
    packageId: string,
    updateDto: UpdatePackageDto,
    userId?: string,
  ): Promise<Package> {
    const packageObjectId = this.toObjectId(packageId, 'packageId');
    const pkg = await this.packageModel.findById(packageObjectId);

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    const before = pkg.toObject() as unknown as Record<string, unknown>;

    // Check name uniqueness if changing
    if (updateDto.name && updateDto.name !== pkg.name) {
      const conflict = await this.packageModel.findOne({
        name: updateDto.name,
      });
      if (conflict) {
        throw new ConflictException(
          `Package named '${updateDto.name}' already exists`,
        );
      }
      pkg.name = updateDto.name;
    }

    if (updateDto.description !== undefined)
      pkg.description = updateDto.description;
    if (updateDto.price !== undefined) pkg.price = updateDto.price;
    if (updateDto.billingCycle) pkg.billingCycle = updateDto.billingCycle;
    if (updateDto.trialDays !== undefined) pkg.trialDays = updateDto.trialDays;
    if (updateDto.isActive !== undefined) pkg.isActive = updateDto.isActive;
    if (updateDto.order !== undefined) pkg.order = updateDto.order;
    if (updateDto.expiryWarningDays !== undefined) {
      pkg.expiryWarningDays =
        typeof updateDto.expiryWarningDays === 'number' &&
        updateDto.expiryWarningDays > 0
          ? updateDto.expiryWarningDays
          : undefined;
    }

    if (updateDto.featureSet) {
      this.validateFeatureSet(updateDto.featureSet as FeatureSet);
      // Only merge defined keys, avoid undefined
      // Only merge defined keys, avoid undefined, and cast to correct type
      pkg.featureSet = Object.fromEntries(
        Object.entries({
          ...pkg.featureSet,
          ...updateDto.featureSet,
        }).filter(([, v]) => typeof v === 'boolean'),
      ) as FeatureSet;
    }

    if (updateDto.limits) {
      this.validateLimits(updateDto.limits as PackageLimits);
      pkg.limits = Object.fromEntries(
        Object.entries({
          ...pkg.limits,
          ...updateDto.limits,
        }).filter(([, v]) => typeof v === 'number'),
      ) as PackageLimits;
    }

    if (userId) {
      pkg.updatedBy = new Types.ObjectId(userId);
    }

    const saved = await pkg.save();

    // Audit log
    await this.auditLogService.log({
      actorId: userId,
      action: 'package_updated',
      resourceType: 'Package',
      resourceId: packageId,
      before: before as unknown as Record<string, unknown>,
      after: saved.toObject() as unknown as Record<string, unknown>,
      status: 'success',
    });

    this.logger.log(`Updated package '${pkg.name}'`);
    return saved;
  }

  /**
   * Delete a package
   */
  async deletePackage(packageId: string, userId?: string): Promise<void> {
    const packageObjectId = this.toObjectId(packageId, 'packageId');
    const pkg = await this.packageModel.findById(packageObjectId);

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    // Check if any tenants are using this package
    const tenantCount = await this.tenantPackageModel.countDocuments({
      packageId: packageObjectId,
    });

    if (tenantCount > 0) {
      throw new BadRequestException(
        `Cannot delete package; ${tenantCount} tenant(s) are using it. Migrate them to another package first.`,
      );
    }

    const before = pkg.toObject();

    await this.packageModel.deleteOne({ _id: packageObjectId });

    // Audit log
    await this.auditLogService.log({
      actorId: userId,
      action: 'package_deleted',
      resourceType: 'Package',
      resourceId: packageId,
      before: before as unknown as Record<string, unknown>,
      status: 'success',
    });

    this.logger.log(`Deleted package '${pkg.name}'`);
  }

  /**
   * Get a single package
   */
  async getPackage(packageId: string): Promise<Package> {
    const packageObjectId = this.toObjectId(packageId, 'packageId');
    const pkg = await this.packageModel.findById(packageObjectId);

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    return pkg;
  }

  /**
   * List all packages
   */
  async listPackages(
    options: { isActive?: boolean; limit?: number; skip?: number } = {},
  ) {
    const filter: FilterQuery<Package> = {};

    if (options.isActive !== undefined) {
      filter.isActive = options.isActive;
    }

    const limit = this.normalizeLimit(options.limit, 50, 100);
    const skip = this.normalizeSkip(options.skip);

    const [data, total] = await Promise.all([
      this.packageModel
        .find(filter)
        .limit(limit)
        .skip(skip)
        .sort('order')
        .exec(),
      this.packageModel.countDocuments(filter),
    ]);

    return { data, total, limit, skip };
  }

  /**
   * Assign a package to a tenant
   */
  async assignPackageToTenant(
    tenantId: string,
    packageId: string,
    options: {
      startTrial?: boolean;
      /** When true, bypass online payment gateway processing (used for manual/offline approvals). */
      skipPayment?: boolean;
      userId?: string;
      paymentToken?: string;
      gatewayName?: string;
    } = {},
    paymentGatewayService?: import('../../payments/services/payment-gateway.service').PaymentGatewayService,
    paymentLogService?: import('../../payments/services/payment-log.service').PaymentLogService,
  ): Promise<TenantPackage> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    const packageObjectId = this.toObjectId(packageId, 'packageId');

    // Validate tenant exists
    const tenant = await this.tenantModel.findById(tenantObjectId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Validate package exists
    const pkg = await this.packageModel.findById(packageObjectId);
    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    if (!pkg.isActive) {
      throw new BadRequestException('Package is not active');
    }

    // Integrate payment gateway (online payment) unless trial or explicitly skipped
    if (!options.startTrial && !options.skipPayment) {
      if (!paymentGatewayService || !paymentLogService) {
        throw new BadRequestException(
          'Payment services are required for payment processing',
        );
      }

      const paymentResult = await paymentGatewayService.processPayment({
        amount: pkg.price,
        currency: 'USD',
        description: `Assign package ${pkg.name} to tenant ${tenantId}`,
        sourceToken: options.paymentToken || 'test_token',
        tenantId,
        packageId,
        gatewayName: options.gatewayName,
        module: 'packages',
      });

      // Structured logging and explicit tracking for payment result
      if (!paymentResult.success) {
        this.logger.error('Payment failed when assigning package', {
          tenantId,
          packageId,
          eventType: 'payment_failure',
          error: paymentResult.error,
        });

        await paymentLogService.record({
          transactionId: paymentResult.transactionId || 'unknown',
          tenantId,
          packageId,
          amount: pkg.price,
          currency: 'USD',
          status: 'failed',
          gatewayName: options.gatewayName || 'stripe',
          error: paymentResult.error,
          createdAt: new Date(),
        });

        throw new BadRequestException('Payment failed: ' + paymentResult.error);
      }

      await paymentLogService.record({
        transactionId: paymentResult.transactionId || 'unknown',
        tenantId,
        packageId,
        amount: pkg.price,
        currency: 'USD',
        status: 'success',
        gatewayName: options.gatewayName || 'stripe',
        createdAt: new Date(),
      });
    }

    // Check if tenant already has a package (unique by tenantId). For upgrades/downgrades,
    // update in-place to avoid unique-index collisions and to support plan changes.
    const existing = await this.tenantPackageModel
      .findOne({ tenantId: tenantObjectId })
      .exec();

    // Calculate dates
    const now = new Date();
    const startedAt = now;
    let trialEndsAt: Date | undefined;
    let expiresAt: Date | undefined;

    if (options.startTrial && pkg.trialDays > 0) {
      trialEndsAt = new Date(
        now.getTime() + pkg.trialDays * 24 * 60 * 60 * 1000,
      );
      expiresAt = trialEndsAt;
    } else {
      // Set expiry based on billing cycle (simplified)
      if (pkg.billingCycle === 'monthly') {
        expiresAt = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          now.getDate(),
        );
      } else if (pkg.billingCycle === 'annual') {
        expiresAt = new Date(
          now.getFullYear() + 1,
          now.getMonth(),
          now.getDate(),
        );
      }
      // lifetime has no expiry
    }

    // Initialize usage counters
    const usageCounters: UsageCounters = {
      domains: 0,
      customDomains: 0,
      subdomains: 0,
      paths: 0,
      storageMb: 0,
      teamMembers: 0,
      pages: 0,
    };

    const statusValue = options.startTrial && pkg.trialDays > 0 ? 'trial' : 'active';

    let saved: TenantPackageDocument;
    if (existing) {
      existing.packageId = new Types.ObjectId(packageId) as any;
      existing.status = statusValue;
      existing.startedAt = startedAt;

      if (trialEndsAt) {
        existing.trialEndsAt = trialEndsAt as any;
      } else {
        (existing as any).trialEndsAt = undefined;
      }

      if (expiresAt) {
        existing.expiresAt = expiresAt as any;
      } else {
        (existing as any).expiresAt = undefined;
      }

      existing.usageCounters = usageCounters as any;
      existing.overrides = {} as any;
      existing.expiryWarningSent = false as any;
      if (options.userId) {
        existing.assignedBy = new Types.ObjectId(options.userId) as any;
      }

      saved = await existing.save();
    } else {
      const tenantPackage = new this.tenantPackageModel({
        tenantId: tenantObjectId,
        packageId: packageObjectId,
        status: statusValue,
        startedAt,
        trialEndsAt,
        expiresAt,
        usageCounters,
        assignedBy: options.userId
          ? new Types.ObjectId(options.userId)
          : undefined,
        expiryWarningSent: false,
      });

      saved = await tenantPackage.save();
    }

    // Update tenant's planKey
    await this.tenantModel.updateOne(
      { _id: tenantObjectId },
      { planKey: pkg.name, status: options.startTrial ? 'trialing' : 'active' },
    );

    // Audit log
    await this.auditLogService.log({
      actorId: options.userId,
      tenantId,
      action: 'package_assigned',
      resourceType: 'TenantPackage',
      resourceId: saved._id.toString(),
      after: saved.toObject() as unknown as Record<string, unknown>,
      status: 'success',
    });

    this.logger.log(`Assigned package '${pkg.name}' to tenant ${tenantId}`);
    return saved as unknown as TenantPackage;
  }

  /**
   * Get tenant's current package
   */
  async getTenantPackage(tenantId: string): Promise<TenantPackage | null> {
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');
    return this.tenantPackageModel
      .findOne({ tenantId: tenantObjectId })
      .populate('packageId')
      .exec();
  }

  /**
   * Check if tenant's trial is active
   */
  async isTrialActive(tenantId: string): Promise<boolean> {
    const tenantPackage = await this.getTenantPackage(tenantId);

    if (!tenantPackage) {
      return false;
    }
    if (tenantPackage.status !== 'trial') {
      return false;
    }
    if (tenantPackage.trialEndsAt && new Date() > tenantPackage.trialEndsAt) {
      // Trial expired, update status and set expiry
      await this.tenantPackageModel.updateOne(
        { _id: tenantPackage.id },
        { status: 'expired', expiresAt: new Date() },
      );
      return false;
    }
    return true;
  }

  /**
   * Scheduled expiry check for tenant packages (to be called by cron or admin)
   */
  async expireTenantPackages(): Promise<number> {
    const now = new Date();
    const expired = await this.tenantPackageModel.updateMany(
      {
        expiresAt: { $lte: now },
        status: { $nin: ['expired'] },
      },
      { $set: { status: 'expired' } },
    );
    return expired.modifiedCount || 0;
  }

  /**
   * Expire tenant packages that have passed their expiry date and
   * send termination notifications, also marking the underlying
   * Tenant records as inactive/expired. Designed for use by a
   * scheduled job or an admin endpoint.
   */
  async expireTenantPackagesWithNotifications(
    billingNotifications: BillingNotificationService,
    tenantsService: TenantsService,
  ): Promise<number> {
    const now = new Date();

    const candidates = await this.tenantPackageModel
      .find({
        expiresAt: { $lte: now },
        status: { $nin: ['expired'] },
      })
      .populate('packageId')
      .exec();

    let processed = 0;

    for (const tenantPackage of candidates as any[]) {
      const tenantIdValue =
        tenantPackage.tenantId && tenantPackage.tenantId.toString
          ? tenantPackage.tenantId.toString()
          : undefined;

      if (!tenantIdValue) continue;

      const email = await tenantsService.getTenantBillingEmail(tenantIdValue);
      const pkg = tenantPackage.packageId as Package;

      if (email) {
        await billingNotifications
          .sendSubscriptionTerminatedEmail({
            to: email,
            tenantId: tenantIdValue,
            packageName: (pkg && pkg.name) || 'Current package',
            expiredAt: tenantPackage.expiresAt || now,
          })
          .catch(() => undefined);
      }

      tenantPackage.status = 'expired';
      await tenantPackage.save();

      await this.tenantModel
        .updateOne(
          { _id: new Types.ObjectId(tenantIdValue) },
          { $set: { status: 'expired', isActive: false } },
        )
        .exec();

      processed += 1;
    }

    return processed;
  }

  /**
   * Compute the maximum subscription expiry warning window across all active packages,
   * based on the optional per-plan expiryWarningDays field. Falls back to the provided
   * global default when no overrides are configured.
   */
  async getMaxExpiryWarningWindow(globalDefaultDays: number): Promise<number> {
    const doc = await this.packageModel
      .find({ isActive: true, expiryWarningDays: { $gt: 0 } })
      .sort({ expiryWarningDays: -1 })
      .limit(1)
      .lean()
      .exec();

    const maxOverride =
      doc && doc.length > 0 && typeof doc[0].expiryWarningDays === 'number'
        ? doc[0].expiryWarningDays
        : 0;

    if (maxOverride > globalDefaultDays) {
      return maxOverride;
    }
    return globalDefaultDays;
  }

  /**
   * Return per-plan summary including expiry settings and tenant counts.
   */
  async getPlanSummary(): Promise<
    Array<{
      package: Package;
      activeTenantCount: number;
      totalTenantCount: number;
    }>
  > {
    const [packages, stats] = await Promise.all([
      this.packageModel.find({}).sort('order').lean().exec(),
      this.tenantPackageModel
        .aggregate([
          {
            $group: {
              _id: '$packageId',
              totalTenantCount: { $sum: 1 },
              activeTenantCount: {
                $sum: {
                  $cond: [{ $in: ['$status', ['trial', 'active']] }, 1, 0],
                },
              },
            },
          },
        ])
        .exec(),
    ]);

    const statsByPackageId = new Map<
      string,
      { activeTenantCount: number; totalTenantCount: number }
    >();
    for (const row of stats) {
      const id = row._id ? String(row._id) : '';
      statsByPackageId.set(id, {
        activeTenantCount: row.activeTenantCount || 0,
        totalTenantCount: row.totalTenantCount || 0,
      });
    }

    return packages.map((pkg) => {
      const key = (pkg as any)._id ? String((pkg as any)._id) : '';
      const s = statsByPackageId.get(key) || {
        activeTenantCount: 0,
        totalTenantCount: 0,
      };
      return {
        package: pkg as any as Package,
        activeTenantCount: s.activeTenantCount,
        totalTenantCount: s.totalTenantCount,
      };
    });
  }

  /**
   * Scan for tenant packages that are about to expire soon and
   * trigger subscription expiry warning emails via BillingNotificationService.
   *
   * This method is designed to be called by a scheduled job or
   * an admin-triggered endpoint. It only sends a single warning
   * per subscription window by toggling the expiryWarningSent flag.
   */
  async sendSubscriptionExpiryWarnings(
    globalDaysBeforeExpiry: number,
    windowDays: number,
    billingNotifications: BillingNotificationService,
    tenantsService: TenantsService,
  ): Promise<number> {
    const now = new Date();
    const cutoff = new Date(now.getTime() + windowDays * 24 * 60 * 60 * 1000);

    const candidates = await this.tenantPackageModel
      .find({
        expiresAt: { $gte: now, $lte: cutoff },
        status: { $in: ['trial', 'active'] },
        expiryWarningSent: { $ne: true },
      })
      .populate('packageId')
      .exec();

    let processed = 0;

    for (const tenantPackage of candidates as any[]) {
      if (!tenantPackage.expiresAt) continue;

      const tenantIdValue = (
        tenantPackage.tenantId && tenantPackage.tenantId.toString
          ? tenantPackage.tenantId.toString()
          : undefined
      ) as string | undefined;
      if (!tenantIdValue) continue;

      const email = await tenantsService.getTenantBillingEmail(tenantIdValue);
      if (!email) continue;

      const pkg = tenantPackage.packageId as Package;

      const effectiveDaysBeforeExpiry = (() => {
        const override = (pkg as any).expiryWarningDays as number | undefined;
        if (typeof override === 'number' && override > 0) {
          return override;
        }
        return globalDaysBeforeExpiry;
      })();

      const effectiveCutoff = new Date(
        now.getTime() + effectiveDaysBeforeExpiry * 24 * 60 * 60 * 1000,
      );

      if (tenantPackage.expiresAt > effectiveCutoff) {
        continue;
      }
      const msRemaining = tenantPackage.expiresAt.getTime() - now.getTime();
      const daysRemaining = Math.max(
        1,
        Math.ceil(msRemaining / (24 * 60 * 60 * 1000)),
      );

      await billingNotifications
        .sendSubscriptionExpiringSoonEmail({
          to: email,
          tenantId: tenantIdValue,
          packageName: (pkg && pkg.name) || 'Current package',
          expiresAt: tenantPackage.expiresAt,
          daysRemaining,
        })
        .catch(() => undefined);

      tenantPackage.expiryWarningSent = true;
      await tenantPackage.save();
      processed += 1;
    }

    return processed;
  }

  /**
   * Check if tenant can use a specific feature
   */
  async canUseFeature(tenantId: string, featureKey: string): Promise<boolean> {
    const tenantPackage = await this.getTenantPackage(tenantId);

    if (!tenantPackage) {
      return false;
    }

    const pkg = tenantPackage.packageId as unknown as Package;

    // Check override first
    if (
      tenantPackage.overrides &&
      tenantPackage.overrides[featureKey] !== undefined
    ) {
      return tenantPackage.overrides[featureKey] as boolean;
    }

    // Check package feature
    return pkg.featureSet[featureKey] === true;
  }

  /**
   * Get usage and limits for a tenant
   */
  async getUsageAndLimits(tenantId: string): Promise<{
    packageName: string;
    status: string;
    trialEndsAt?: Date;
    expiresAt?: Date;
    usage: UsageCounters;
    limits: PackageLimits;
    features: FeatureSet;
    utilization: Record<string, number>;
  }> {
    const tenantPackage = await this.getTenantPackage(tenantId);

    if (!tenantPackage) {
      throw new NotFoundException('Tenant has no active package');
    }

    const pkg = tenantPackage.packageId as unknown as Package;

    return {
      packageName: pkg.name,
      status: tenantPackage.status,
      trialEndsAt: tenantPackage.trialEndsAt,
      expiresAt: tenantPackage.expiresAt,
      usage: tenantPackage.usageCounters,
      limits: pkg.limits,
      features: pkg.featureSet,
      utilization: this.calculateUtilization(
        tenantPackage.usageCounters,
        pkg.limits,
      ),
    };
  }

  /**
   * Calculate utilization percentages
   */
  private calculateUtilization(
    usage: UsageCounters,
    limits: PackageLimits,
  ): Record<string, number> {
    const result: Record<string, number> = {};

    for (const [key, limit] of Object.entries(limits)) {
      const limitValue = typeof limit === 'number' ? limit : 0;
      if (limitValue > 0) {
        const currentUsage = usage[key as keyof UsageCounters] ?? 0;
        result[key] = Math.round((currentUsage / limitValue) * 100);
      }
    }

    return result;
  }

  /**
   * Validate feature set keys
   */
  private validateFeatureSet(featureSet: Record<string, unknown>): void {
    for (const key of Object.keys(featureSet)) {
      if (typeof featureSet[key] !== 'boolean') {
        throw new BadRequestException(`Feature '${key}' must be a boolean`);
      }
    }
  }

  /**
   * Validate limits keys
   */
  private validateLimits(limits: Record<string, unknown>): void {
    for (const key of Object.keys(limits)) {
      if (typeof limits[key] !== 'number' || limits[key] < 0) {
        throw new BadRequestException(
          `Limit '${key}' must be a non-negative number`,
        );
      }
    }
  }
}
