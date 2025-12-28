import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Package, FeatureSet, PackageLimits } from '@schemas/package.schema';
import { TenantPackage, UsageCounters } from '@schemas/tenant-package.schema';
import { Tenant } from '@schemas/tenant.schema';
import { AuditLogService } from '@services/audit-log.service';

export class CreatePackageDto {
  name!: string;
  description?: string;
  price!: number;
  billingCycle!: 'monthly' | 'annual' | 'lifetime';
  trialDays?: number;
  featureSet!: FeatureSet;
  limits!: PackageLimits;
  order?: number;
}

export class UpdatePackageDto {
  name?: string;
  description?: string;
  price?: number;
  billingCycle?: 'monthly' | 'annual' | 'lifetime';
  trialDays?: number;
  isActive?: boolean;
  featureSet?: Partial<FeatureSet>;
  limits?: Partial<PackageLimits>;
  order?: number;
}

export class AssignPackageDto {
  packageId!: string;
  tenantId!: string;
  startTrial?: boolean; // Start with trial period
  notes?: string;
}

@Injectable()
export class PackageService {
  private readonly logger = new Logger(PackageService.name);

  constructor(
    @InjectModel(Package.name) private packageModel: Model<Package>,
    @InjectModel(TenantPackage.name)
    private tenantPackageModel: Model<TenantPackage>,
    @InjectModel(Tenant.name) private tenantModel: Model<Tenant>,
    private auditLogService: AuditLogService,
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
    const pkg = await this.packageModel.findById(packageId);

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
    const pkg = await this.packageModel.findById(packageId);

    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    // Check if any tenants are using this package
    const tenantCount = await this.tenantPackageModel.countDocuments({
      packageId,
    });

    if (tenantCount > 0) {
      throw new BadRequestException(
        `Cannot delete package; ${tenantCount} tenant(s) are using it. Migrate them to another package first.`,
      );
    }

    const before = pkg.toObject();

    await this.packageModel.deleteOne({ _id: packageId });

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
    const pkg = await this.packageModel.findById(packageId);

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

    const limit = Math.min(options.limit || 50, 100);
    const skip = options.skip || 0;

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
    options: { startTrial?: boolean; userId?: string } = {},
  ): Promise<TenantPackage> {
    // Validate tenant exists
    const tenant = await this.tenantModel.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Validate package exists
    const pkg = await this.packageModel.findById(packageId);
    if (!pkg) {
      throw new NotFoundException('Package not found');
    }

    if (!pkg.isActive) {
      throw new BadRequestException('Package is not active');
    }

    // Check if tenant already has a package
    const existing = await this.tenantPackageModel.findOne({
      tenantId: new Types.ObjectId(tenantId),
    });

    if (existing) {
      throw new ConflictException(
        'Tenant already has an active package assignment',
      );
    }

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

    const tenantPackage = new this.tenantPackageModel({
      tenantId: new Types.ObjectId(tenantId),
      packageId: new Types.ObjectId(packageId),
      status: options.startTrial && pkg.trialDays > 0 ? 'trial' : 'active',
      startedAt,
      trialEndsAt,
      expiresAt,
      usageCounters,
      assignedBy: options.userId
        ? new Types.ObjectId(options.userId)
        : undefined,
    });

    const saved = await tenantPackage.save();

    // Update tenant's planKey
    await this.tenantModel.updateOne(
      { _id: tenantId },
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
    return saved;
  }

  /**
   * Get tenant's current package
   */
  async getTenantPackage(tenantId: string): Promise<TenantPackage | null> {
    return this.tenantPackageModel
      .findOne({ tenantId: new Types.ObjectId(tenantId) })
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
      // Trial expired, update status
      await this.tenantPackageModel.updateOne(
        { _id: tenantPackage.id },
        { status: 'expired' },
      );
      return false;
    }

    return true;
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
