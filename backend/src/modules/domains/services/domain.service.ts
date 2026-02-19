import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { objectIdToString } from '../../../utils/objectIdToString';
import { Domain } from '../../../database/schemas/domain.schema';
import { TenantPackage } from '../../../database/schemas/tenant-package.schema';
import { Package } from '../../../database/schemas/package.schema';
import { AuditLogService } from '../../../services/audit-log.service';
import { DomainResellerService } from './domain-reseller.service';
import { DnsRecord } from './domain-reseller.provider';
import {
  CreateDomainDto,
  UpdateDomainDto,
  ListDomainsQueryDto,
} from '../../domains/dto/domain.dto';

const RESERVED_SUBDOMAINS = [
  'www',
  'mail',
  'ftp',
  'api',
  'admin',
  'dashboard',
  'app',
];
const RESERVED_PATHS = ['admin', 'api', 'auth', 'health', 'static'];
const PLATFORM_DOMAIN = process.env.PLATFORM_DOMAIN || 'localhost';

@Injectable()
export class DomainService {
  private readonly logger = new Logger(DomainService.name);

  constructor(
    @InjectModel(Domain.name) private domainModel: Model<Domain>,
    @InjectModel(TenantPackage.name)
    private tenantPackageModel: Model<TenantPackage>,
    @InjectModel(Package.name) private packageModel: Model<Package>,
    private auditLogService: AuditLogService,
    private readonly domainResellerService: DomainResellerService,
  ) {}

  /**
   * Create a new path or subdomain for a tenant
   */
  async createDomain(
    tenantId: string,
    createDto: CreateDomainDto,
    userId?: string,
  ): Promise<Domain> {
    const { type, value } = createDto;

    // Validate input
    if (!value || value.trim().length === 0) {
      throw new BadRequestException('Domain value cannot be empty');
    }

    const normalizedValue = value.toLowerCase().trim();

    // Check reserved names
    const reservedList =
      type === 'subdomain' ? RESERVED_SUBDOMAINS : RESERVED_PATHS;
    if (reservedList.includes(normalizedValue)) {
      throw new BadRequestException(
        `'${normalizedValue}' is a reserved domain name`,
      );
    }

    // Check uniqueness (across all tenants)
    const exists = await this.domainModel.findOne({
      type,
      value: normalizedValue,
    });

    if (exists) {
      throw new ConflictException(
        `${type} '${normalizedValue}' is already taken`,
      );
    }

    // Check package limits
    await this.enforcePackageLimits(tenantId, type);

    // Create domain
    const domain = new this.domainModel({
      tenantId: new Types.ObjectId(tenantId),
      type,
      value: normalizedValue,
      status: 'pending',
      createdBy: userId ? new Types.ObjectId(userId) : undefined,
    });

    const saved = await domain.save();

    // Increment usage counter
    await this.incrementUsageCounter(tenantId, type);

    // Audit log
    await this.auditLogService.log({
      actorId: userId,
      tenantId,
      action: `domain_${type}_created`,
      resourceType: 'Domain',
      resourceId: objectIdToString(saved._id),
      after: saved.toObject() as unknown as Record<string, unknown>,
      status: 'success',
    });

    this.logger.log(
      `Created ${type} domain '${normalizedValue}' for tenant ${tenantId}`,
    );
    return saved;
  }

  /**
   * Update domain (status, primary flag)
   */
  async updateDomain(
    tenantId: string,
    domainId: string,
    updateDto: UpdateDomainDto,
    userId?: string,
  ): Promise<Domain> {
    const domain = await this.domainModel.findById(domainId);
    if (!domain) {
      throw new NotFoundException('Domain not found');
    }

    // Verify ownership
    if (objectIdToString(domain.tenantId) !== objectIdToString(tenantId)) {
      throw new BadRequestException('Unauthorized');
    }

    const before = domain.toObject() as unknown as Record<string, unknown>;

    const wasActive = domain.status === 'active';

    // Update fields
    if (updateDto.status) {
      domain.status = updateDto.status;
    }

    if (updateDto.isPrimary !== undefined) {
      domain.isPrimary = updateDto.isPrimary;
    }

    if (userId) {
      domain.updatedBy = new Types.ObjectId(userId);
    }

    const saved = await domain.save();

    // If a subdomain transitions to active, automatically provision DNS and record status
    if (
      domain.type === 'subdomain' &&
      !wasActive &&
      saved.status === 'active'
    ) {
      const hostname = `${saved.value}.${PLATFORM_DOMAIN}`;
      const serverIp = process.env.SERVER_IP;
      const providerId =
        process.env.DOMAIN_RESELLER_PROVIDER === 'cloudflare'
          ? 'cloudflare'
          : 'stub';

      if (serverIp) {
        const records: DnsRecord[] = [
          {
            type: 'A',
            name: hostname,
            value: serverIp,
            ttl: 3600,
          },
        ];
        try {
          await this.domainResellerService.ensureDns(hostname, records);
          saved.dnsProvider = providerId;
          saved.dnsSyncedAt = new Date();
          saved.dnsLastError = undefined;
          await saved.save();
        } catch (err) {
          const message = (err as Error).message;
          this.logger.warn(
            `Failed to auto-provision DNS for subdomain ${hostname}: ${message}`,
          );
          saved.dnsProvider = providerId;
          saved.dnsLastError = message;
          await saved.save();
        }
      } else {
        const msg = `SERVER_IP env var not set; skipping DNS provisioning for subdomain ${hostname}.`;
        this.logger.warn(msg);
        saved.dnsProvider = providerId;
        saved.dnsLastError = msg;
        await saved.save();
      }
    }

    // Audit log
    await this.auditLogService.log({
      actorId: userId,
      tenantId,
      action: 'domain_updated',
      resourceType: 'Domain',
      resourceId: domainId,
      before: before ? JSON.parse(JSON.stringify(before)) : undefined,
      after: saved.toObject() as unknown as Record<string, unknown>,
      status: 'success',
    });

    return saved;
  }

  /**
   * Set a domain as primary (unsets previous primary)
   */
  async setPrimaryDomain(
    tenantId: string,
    domainId: string,
    userId?: string,
  ): Promise<Domain> {
    const domain = await this.domainModel.findById(domainId);

    if (!domain) {
      throw new NotFoundException('Domain not found');
    }

    if (domain.tenantId.toString() !== tenantId) {
      throw new BadRequestException('Unauthorized');
    }

    if (domain.status !== 'active') {
      throw new BadRequestException(
        'Only active domains can be set as primary',
      );
    }

    // Unset current primary
    await this.domainModel.updateMany(
      { tenantId: new Types.ObjectId(tenantId), _id: { $ne: domainId } },
      { isPrimary: false },
    );

    // Set this as primary
    domain.isPrimary = true;
    const saved = await domain.save();

    // Audit log
    await this.auditLogService.log({
      actorId: userId,
      tenantId,
      action: 'domain_set_primary',
      resourceType: 'Domain',
      resourceId: domainId,
      after: saved.toObject() as unknown as Record<string, unknown>,
      status: 'success',
    });

    this.logger.log(`Set domain ${domainId} as primary for tenant ${tenantId}`);
    return saved;
  }

  /**
   * Delete a domain
   */
  async deleteDomain(
    tenantId: string,
    domainId: string,
    userId?: string,
  ): Promise<void> {
    const domain = await this.domainModel.findById(domainId);

    if (!domain) {
      throw new NotFoundException('Domain not found');
    }

    if (domain.tenantId.toString() !== tenantId) {
      throw new BadRequestException('Unauthorized');
    }

    if (domain.isPrimary) {
      throw new BadRequestException(
        'Cannot delete primary domain; set another as primary first',
      );
    }

    const before = domain.toObject();

    await this.domainModel.deleteOne({ _id: domainId });

    // Decrement usage counter
    await this.decrementUsageCounter(tenantId, domain.type);

    // Audit log
    await this.auditLogService.log({
      actorId: userId,
      tenantId,
      action: `domain_${domain.type}_deleted`,
      resourceType: 'Domain',
      resourceId: domainId,
      before: before ? JSON.parse(JSON.stringify(before)) : undefined,
      status: 'success',
    });

    this.logger.log(
      `Deleted ${domain.type} domain ${domainId} for tenant ${tenantId}`,
    );
  }

  /**
   * Get domains for a tenant
   */
  async getDomainsForTenant(tenantId: string, query: ListDomainsQueryDto = {}) {
    const filter: FilterQuery<Domain> = {
      tenantId: new Types.ObjectId(tenantId),
    };

    if (query.type) {
      filter.type = query.type;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.isPrimary !== undefined) {
      filter.isPrimary = query.isPrimary;
    }

    const limit = Math.min(query.limit || 50, 100);
    const skip = query.skip || 0;

    const [data, total] = await Promise.all([
      this.domainModel
        .find(filter)
        .limit(limit)
        .skip(skip)
        .sort('-createdAt')
        .exec(),
      this.domainModel.countDocuments(filter),
    ]);

    return {
      data: data.map((d) => this.formatDomainResponse(d)),
      total,
      limit,
      skip,
    };
  }

  /**
   * Get all domains (admin view)
   */
  async getAllDomains(query: ListDomainsQueryDto = {}) {
    const filter: FilterQuery<Domain> = {};

    if (query.type) {
      filter.type = query.type;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.tenantId) {
      filter.tenantId = new Types.ObjectId(query.tenantId);
    }

    const limit = Math.min(query.limit || 50, 100);
    const skip = query.skip || 0;

    const [data, total] = await Promise.all([
      this.domainModel
        .find(filter)
        .limit(limit)
        .skip(skip)
        .sort('-createdAt')
        .populate('tenantId', 'name slug')
        .exec(),
      this.domainModel.countDocuments(filter),
    ]);

    return {
      data: data.map((d) => this.formatDomainResponse(d)),
      total,
      limit,
      skip,
    };
  }

  /**
   * Check if domain value is available
   */
  async checkAvailability(
    type: 'path' | 'subdomain',
    value: string,
  ): Promise<boolean> {
    const normalizedValue = value.toLowerCase().trim();

    const reservedList =
      type === 'subdomain' ? RESERVED_SUBDOMAINS : RESERVED_PATHS;
    if (reservedList.includes(normalizedValue)) {
      return false;
    }

    const exists = await this.domainModel.findOne({
      type,
      value: normalizedValue,
    });
    return !exists;
  }

  /**
   * Get primary domain for a tenant
   */
  async getPrimaryDomain(tenantId: string): Promise<Domain | null> {
    return this.domainModel.findOne({
      tenantId: new Types.ObjectId(tenantId),
      isPrimary: true,
      status: 'active',
    });
  }

  /**
   * Enforce package limits on domain creation
   */
  private async enforcePackageLimits(
    tenantId: string,
    type: 'path' | 'subdomain',
  ): Promise<void> {
    const tenantPackage = await this.tenantPackageModel
      .findOne({ tenantId: new Types.ObjectId(tenantId) })
      .populate('packageId')
      .exec();

    if (!tenantPackage) {
      throw new BadRequestException('Tenant has no active package');
    }

    const pkg = tenantPackage.packageId as unknown as Package;

    // Check feature enabled
    const featureKey =
      type === 'subdomain' ? 'allowSubdomain' : 'allowPathDomain';
    if (!pkg.featureSet[featureKey]) {
      throw new BadRequestException(
        `Your package does not allow ${type} domains. Please upgrade.`,
      );
    }

    // Check usage limits
    const limitKey = type === 'subdomain' ? 'maxSubdomains' : 'maxPaths';
    const maxAllowed = pkg.limits[limitKey] || 0;

    if (maxAllowed === 0) {
      throw new BadRequestException(
        `Your package does not allow ${type} domains`,
      );
    }

    const currentUsage = tenantPackage.usageCounters[limitKey] || 0;
    if (currentUsage >= maxAllowed) {
      throw new BadRequestException(
        `You have reached the limit of ${maxAllowed} ${type} domains. Please upgrade your package.`,
      );
    }
  }

  /**
   * Increment usage counter in TenantPackage
   */
  private async incrementUsageCounter(
    tenantId: string,
    type: 'path' | 'subdomain',
  ): Promise<void> {
    const counterKey =
      type === 'subdomain' ? 'usageCounters.subdomains' : 'usageCounters.paths';

    await this.tenantPackageModel.updateOne(
      { tenantId: new Types.ObjectId(tenantId) },
      { $inc: { [counterKey]: 1 } },
    );
  }

  /**
   * Decrement usage counter in TenantPackage
   */
  private async decrementUsageCounter(
    tenantId: string,
    type: 'path' | 'subdomain',
  ): Promise<void> {
    const counterKey =
      type === 'subdomain' ? 'usageCounters.subdomains' : 'usageCounters.paths';

    await this.tenantPackageModel.updateOne(
      { tenantId: new Types.ObjectId(tenantId) },
      { $inc: { [counterKey]: -1 } },
    );
  }

  /**
   * Format domain for response
   */
  private formatDomainResponse(domain: Domain): Record<string, unknown> {
    const computedUrl =
      domain.type === 'subdomain'
        ? `${domain.value}.${PLATFORM_DOMAIN}`
        : `${PLATFORM_DOMAIN}/${domain.value}`;

    const domainObj = (domain as any).toObject
      ? (domain as any).toObject()
      : domain;
    return {
      _id: objectIdToString(domainObj._id),
      tenantId: domainObj.tenantId,
      type: domainObj.type,
      value: domainObj.value,
      status: domainObj.status,
      isPrimary: domainObj.isPrimary,
      computedUrl,
      createdBy: domainObj.createdBy,
      updatedBy: domainObj.updatedBy,
      createdAt: domainObj.createdAt,
      updatedAt: domainObj.updatedAt,
      dnsProvider: domainObj.dnsProvider,
      dnsSyncedAt: domainObj.dnsSyncedAt,
      dnsLastError: domainObj.dnsLastError,
    };
  }
}
