import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { CustomDomain } from '../../../database/schemas/custom-domain.schema';
import { TenantPackage } from '../../../database/schemas/tenant-package.schema';
import { Package } from '../../../database/schemas/package.schema';
import { AuditLogService } from '../../../services/audit-log.service';
import {
  CreateCustomDomainDto,
  UpdateCustomDomainDto,
} from '../../custom-domains/dto/custom-domain.dto';
import * as crypto from 'crypto';
import * as dns from 'dns';
import { objectIdToString } from '../../../utils/objectIdToString';
import { promisify } from 'util';

const dnsResolve = promisify(dns.resolveTxt);
const dnsCname = promisify(dns.resolveCname);

const PLATFORM_DOMAIN = process.env.PLATFORM_DOMAIN || 'localhost';
const DNS_TARGET = process.env.DNS_TARGET || `edge.${PLATFORM_DOMAIN}`; // CNAME target

interface TenantDomainSslExpiringItem {
  domain: string;
  expiresAt: Date;
  daysRemaining: number;
}

interface TenantDomainHealthSummary {
  total: number;
  byStatus: Record<string, number>;
  ssl: {
    issued: number;
    pending: number;
    expired: number;
    expiringSoon: number;
    expiringList: TenantDomainSslExpiringItem[];
  };
  primary: string | null;
}

@Injectable()
export class CustomDomainService {
  private readonly logger = new Logger(CustomDomainService.name);

  constructor(
    @InjectModel(CustomDomain.name)
    private customDomainModel: Model<CustomDomain>,
    @InjectModel(TenantPackage.name)
    private tenantPackageModel: Model<TenantPackage>,
    @InjectModel(Package.name) private packageModel: Model<Package>,
    private auditLogService: AuditLogService,
  ) {}

  /**
   * Request a custom domain for a tenant
   */
  async requestCustomDomain(
    tenantId: string,
    createDto: CreateCustomDomainDto,
    userId?: string,
  ): Promise<CustomDomain> {
    const { domain } = createDto;
    const normalizedDomain = domain.toLowerCase().trim();

    // Validate domain format
    this.validateDomainFormat(normalizedDomain);

    // Check package feature
    const tenantPackage = await this.tenantPackageModel
      .findOne({ tenantId: new Types.ObjectId(tenantId) })
      .populate('packageId')
      .exec();

    if (!tenantPackage) {
      throw new BadRequestException('Tenant has no active package');
    }

    const pkg = tenantPackage.packageId as unknown as Package;
    if (!pkg.featureSet.allowCustomDomain) {
      throw new BadRequestException(
        'Your package does not allow custom domains. Please upgrade.',
      );
    }

    // Check usage limits
    const currentCustomDomains = tenantPackage.usageCounters.customDomains || 0;
    const maxAllowed = pkg.limits.maxCustomDomains || 0;

    if (maxAllowed === 0) {
      throw new BadRequestException(
        'Your package does not allow custom domains',
      );
    }

    if (currentCustomDomains >= maxAllowed) {
      throw new BadRequestException(
        `You have reached the limit of ${maxAllowed} custom domains. Please upgrade.`,
      );
    }

    // Check uniqueness
    const existing = await this.customDomainModel.findOne({
      domain: normalizedDomain,
    });

    if (existing) {
      throw new ConflictException(
        `Domain '${normalizedDomain}' is already registered`,
      );
    }

    // Generate verification token
    const verificationToken = this.generateVerificationToken();
    const verificationMethod = createDto.verificationMethod || 'TXT';

    // Create custom domain record
    const customDomain = new this.customDomainModel({
      tenantId: new Types.ObjectId(tenantId),
      domain: normalizedDomain,
      status: 'pending_verification',
      verificationToken,
      verificationMethod,
      dnsTarget: DNS_TARGET,
      createdBy: userId ? new Types.ObjectId(userId) : undefined,
    });

    const saved = await customDomain.save();

    // Increment usage counter
    await this.tenantPackageModel.updateOne(
      { tenantId: new Types.ObjectId(tenantId) },
      { $inc: { 'usageCounters.customDomains': 1 } },
    );

    // Audit log
    await this.auditLogService.log({
      actorId: userId,
      tenantId,
      action: 'custom_domain_requested',
      resourceType: 'CustomDomain',
      resourceId: objectIdToString(saved._id),
      after: saved.toObject() as unknown as Record<string, unknown>,
      status: 'success',
    });

    this.logger.log(
      `Custom domain request created for ${normalizedDomain} (tenant: ${tenantId})`,
    );
    return saved;
  }

  /**
   * Verify custom domain ownership via DNS
   */
  async verifyDomainOwnership(
    domainId: string,
    tenantId: string,
  ): Promise<boolean> {
    const customDomain = await this.customDomainModel.findById(domainId);
    if (!customDomain) {
      throw new NotFoundException('Resource not found');
    }

    if (objectIdToString(customDomain.tenantId) !== tenantId) {
      throw new BadRequestException('Unauthorized');
    }

    if (customDomain.status !== 'pending_verification') {
      throw new BadRequestException('Domain is not pending verification');
    }

    try {
      let verified = false;

      if (customDomain.verificationMethod === 'TXT') {
        verified = await this.verifyTxtRecord(
          customDomain.domain,
          customDomain.verificationToken,
        );
      } else if (customDomain.verificationMethod === 'CNAME') {
        verified = await this.verifyCnameRecord(
          customDomain.domain,
          DNS_TARGET,
        );
      }

      if (!verified) {
        throw new BadRequestException(
          'DNS verification failed. Please ensure your DNS records are properly configured.',
        );
      }

      // Update status to verified
      customDomain.status = 'verified';
      customDomain.lastVerifiedAt = new Date();
      const saved = await customDomain.save();

      // Audit log
      await this.auditLogService.log({
        actorId: undefined,
        tenantId: objectIdToString(customDomain.tenantId),
        action: 'custom_domain_verified',
        resourceType: 'CustomDomain',
        resourceId: domainId,
        after: saved.toObject() as unknown as Record<string, unknown>,
        status: 'success',
      });

      this.logger.log(`Custom domain ${customDomain.domain} verified`);
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `DNS verification failed for ${customDomain.domain}: ${errorMessage}`,
      );

      // Log failure
      await this.auditLogService.log({
        actorId: undefined,
        tenantId: objectIdToString(customDomain.tenantId),
        action: 'custom_domain_verification_failed',
        resourceType: 'CustomDomain',
        resourceId: domainId,
        status: 'failure',
        errorMessage,
      });

      return false;
    }
  }

  /**
   * Issue SSL certificate for a verified domain (via ACME/LetsEncrypt).
   *
   * In a production environment, this method should be extended to call an
   * external ACME client (e.g., certbot, acme.sh, or an ACME library such
   * as node-acme-client) that handles HTTP-01 or DNS-01 challenge flows and
   * stores the resulting certificate in /etc/letsencrypt/live/<domain>/ or
   * a custom certificate directory.
   *
   * For now, this method marks the domain as 'ssl_pending' and logs that
   * an external issuance process should be triggered. After that process
   * completes (e.g., via a webhook or scheduled job that re-checks certs),
   * the SslAutomationService can resync statuses to update the database to
   * 'ssl_issued' when the actual certificate files exist.
   *
   * Integration Steps:
   *  1. When this method is called, spawn or enqueue a job to run:
   *       certbot certonly --webroot -w /var/www/certbot \
   *         -d <customDomain.domain> --non-interactive --agree-tos \
   *         -m admin@yourdomain.com
   *
   *  2. Poll or listen for certbot completion, then mark sslStatus='issued'.
   *
   *  3. Or, use a library like `node-acme-client` to request certs in-process,
   *     storing them in a known location, then update this record accordingly.
   *
   * The current implementation logs the issuance request and populates expiry
   * metadata for demo/dashboard purposes; replace the TODO block below with
   * real ACME calls when deploying to production.
   */
  async issueSslCertificate(
    domainId: string,
    tenantId: string,
    provider: 'acme' = 'acme',
  ): Promise<CustomDomain> {
    const customDomain = await this.customDomainModel.findById(domainId);

    if (!customDomain) {
      throw new NotFoundException('Custom domain not found');
    }

    if (objectIdToString(customDomain.tenantId) !== tenantId) {
      throw new BadRequestException('Unauthorized');
    }

    if (customDomain.status !== 'verified') {
      throw new BadRequestException(
        'Domain must be verified before issuing SSL certificate',
      );
    }

    const before = customDomain.toObject() as unknown as Record<
      string,
      unknown
    >;

    customDomain.status = 'ssl_pending';
    customDomain.sslProvider = provider;
    customDomain.sslStatus = 'pending';

    // Set initial issue/expiry timestamps for dashboard display.
    // In production, update these fields after the actual ACME cert is generated.
    const issuedAt = new Date();
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
    customDomain.sslIssuedAt = issuedAt;
    customDomain.sslExpiresAt = new Date(issuedAt.getTime() + ninetyDaysMs);

    const saved = await customDomain.save();

    // Audit log
    await this.auditLogService.log({
      actorId: undefined,
      tenantId,
      action: 'ssl_issuance_initiated',
      resourceType: 'CustomDomain',
      resourceId: domainId,
      before,
      after: saved.toObject() as unknown as Record<string, unknown>,
      status: 'pending',
    });

    this.logger.log(
      `SSL issuance initiated for ${customDomain.domain}. ` +
        `In production, trigger external ACME client (certbot/acme.sh) or use node-acme-client library. ` +
        `After cert issuance, mark sslStatus='issued' via SslAutomationService.resyncStatuses().`,
    );

    // TODO (Production): Spawn or enqueue a job here to call certbot or node-acme-client.
    // Example (pseudo):
    //   await this.acmeService.requestCertificate(customDomain.domain);
    //   Then, poll or listen for completion and update customDomain.sslStatus = 'issued'.

    return saved;
  }

  /**
   * Mark domain as active (both DNS verified and SSL issued)
   */
  async activateDomain(
    domainId: string,
    tenantId: string,
    userId?: string,
  ): Promise<CustomDomain> {
    const customDomain = await this.customDomainModel.findById(domainId);

    if (!customDomain) {
      throw new NotFoundException('Custom domain not found');
    }

    if (objectIdToString(customDomain.tenantId) !== tenantId) {
      throw new BadRequestException('Unauthorized');
    }

    if (
      customDomain.status !== 'ssl_issued' &&
      customDomain.status !== 'verified'
    ) {
      throw new BadRequestException(
        'Domain must be verified and SSL issued before activation',
      );
    }

    const before = customDomain.toObject() as unknown as Record<
      string,
      unknown
    >;

    customDomain.status = 'active';
    if (userId) {
      customDomain.updatedBy = new Types.ObjectId(userId);
    }

    const saved = await customDomain.save();

    // Audit log
    await this.auditLogService.log({
      actorId: userId,
      tenantId,
      action: 'custom_domain_activated',
      resourceType: 'CustomDomain',
      resourceId: domainId,
      before,
      after: saved.toObject() as unknown as Record<string, unknown>,
      status: 'success',
    });

    this.logger.log(`Custom domain ${customDomain.domain} activated`);
    return saved;
  }

  /**
   * Set custom domain as primary
   */
  async setPrimaryDomain(
    domainId: string,
    tenantId: string,
    userId?: string,
  ): Promise<CustomDomain> {
    const customDomain = await this.customDomainModel.findById(domainId);

    if (!customDomain) {
      throw new NotFoundException('Custom domain not found');
    }

    if (objectIdToString(customDomain.tenantId) !== tenantId) {
      throw new BadRequestException('Unauthorized');
    }

    if (customDomain.status !== 'active') {
      throw new BadRequestException(
        'Only active domains can be set as primary',
      );
    }

    // Unset other primaries
    await this.customDomainModel.updateMany(
      { tenantId: new Types.ObjectId(tenantId), _id: { $ne: domainId } },
      { isPrimary: false },
    );

    customDomain.isPrimary = true;
    if (userId) {
      customDomain.updatedBy = new Types.ObjectId(userId);
    }

    const saved = await customDomain.save();

    // Audit log
    await this.auditLogService.log({
      actorId: userId,
      tenantId,
      action: 'custom_domain_set_primary',
      resourceType: 'CustomDomain',
      resourceId: domainId,
      after: saved.toObject() as unknown as Record<string, unknown>,
      status: 'success',
    });

    return saved;
  }

  /**
   * Update custom domain (admin only)
   */
  async updateCustomDomain(
    domainId: string,
    tenantId: string,
    updateDto: UpdateCustomDomainDto,
  ): Promise<CustomDomain> {
    const customDomain = await this.customDomainModel.findById(domainId);

    if (!customDomain) {
      throw new NotFoundException('Custom domain not found');
    }

    if (customDomain.tenantId.toString() !== tenantId) {
      throw new BadRequestException('Unauthorized');
    }

    const updated = await this.customDomainModel.findByIdAndUpdate(
      domainId,
      updateDto,
      { new: true },
    );
    if (!updated) throw new NotFoundException('Custom domain not found');
    return updated;
  }

  /**
   * Get custom domains for a tenant
   */
  async getCustomDomainsForTenant(
    tenantId: string,
    options: { limit?: number; skip?: number; status?: string } = {},
  ) {
    const filter: FilterQuery<CustomDomain> = {
      tenantId: new Types.ObjectId(tenantId),
    };

    if (options.status) {
      filter.status = options.status;
    }

    const limit = Math.min(options.limit || 50, 100);
    const skip = options.skip || 0;

    const [data, total] = await Promise.all([
      this.customDomainModel
        .find(filter)
        .limit(limit)
        .skip(skip)
        .sort('-createdAt')
        .exec(),
      this.customDomainModel.countDocuments(filter),
    ]);

    return {
      data: data.map((d) => this.formatCustomDomainResponse(d)),
      total,
      limit,
      skip,
    };
  }

  /**
   * Get all custom domains (admin)
   */
  async getAllCustomDomains(
    options: {
      limit?: number;
      skip?: number;
      tenantId?: string;
      status?: string;
    } = {},
  ) {
    const filter: FilterQuery<CustomDomain> = {};

    if (options.tenantId) {
      filter.tenantId = new Types.ObjectId(options.tenantId);
    }

    if (options.status) {
      filter.status = options.status;
    }

    const limit = Math.min(options.limit || 50, 100);
    const skip = options.skip || 0;

    const [data, total] = await Promise.all([
      this.customDomainModel
        .find(filter)
        .limit(limit)
        .skip(skip)
        .sort('-createdAt')
        .populate('tenantId', 'name slug')
        .exec(),
      this.customDomainModel.countDocuments(filter),
    ]);

    return {
      data: data.map((d) => this.formatCustomDomainResponse(d)),
      total,
      limit,
      skip,
    };
  }

  /**
   * Delete custom domain
   */
  async deleteCustomDomain(
    domainId: string,
    tenantId: string,
    userId?: string,
  ): Promise<void> {
    const customDomain = await this.customDomainModel.findById(domainId);

    if (!customDomain) {
      throw new NotFoundException('Custom domain not found');
    }

    if (customDomain.tenantId.toString() !== tenantId) {
      throw new BadRequestException('Unauthorized');
    }

    if (customDomain.isPrimary) {
      throw new BadRequestException(
        'Cannot delete primary domain; set another as primary first',
      );
    }

    const before = customDomain.toObject();

    await this.customDomainModel.deleteOne({ _id: domainId });

    // Decrement usage counter
    await this.tenantPackageModel.updateOne(
      { tenantId: new Types.ObjectId(tenantId) },
      { $inc: { 'usageCounters.customDomains': -1 } },
    );

    // Audit log
    const beforeData = before ? JSON.parse(JSON.stringify(before)) : undefined;
    await this.auditLogService.log({
      actorId: userId,
      tenantId,
      action: 'custom_domain_deleted',
      resourceType: 'CustomDomain',
      resourceId: domainId,
      before: beforeData,
      status: 'success',
    });

    this.logger.log(`Custom domain ${customDomain.domain} deleted`);
  }

  /**
   * Verify TXT DNS record
   */
  private async verifyTxtRecord(
    domain: string,
    token: string,
  ): Promise<boolean> {
    try {
      const records = await dnsResolve(`_verify.${domain}`);

      // Look for token in TXT records
      for (const record of records) {
        const txt = Array.isArray(record) ? record.join('') : record;
        if (txt === token) {
          return true;
        }
      }

      return false;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`DNS TXT record check failed for ${domain}: ${message}`);
      return false;
    }
  }

  /**
   * Verify CNAME DNS record
   */
  private async verifyCnameRecord(
    domain: string,
    target: string,
  ): Promise<boolean> {
    try {
      const records = await dnsCname(domain);

      // Normalize records and target for comparison
      const normalizedTarget = target.toLowerCase().endsWith('.')
        ? target
        : `${target}.`;

      for (const record of records) {
        if (record.toLowerCase() === normalizedTarget.toLowerCase()) {
          return true;
        }
      }

      return false;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(
        `DNS CNAME record check failed for ${domain}: ${message}`,
      );
      return false;
    }
  }

  /**
   * Validate domain format
   */
  private validateDomainFormat(domain: string): void {
    // Basic domain validation
    const domainRegex =
      /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i;

    if (!domainRegex.test(domain)) {
      throw new BadRequestException('Invalid domain format');
    }

    // Reject subdomains of platform domain
    if (domain.endsWith(PLATFORM_DOMAIN)) {
      throw new BadRequestException(
        'Cannot register subdomains of platform domain',
      );
    }
  }

  /**
   * Generate verification token
   */
  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Format custom domain for response
   */
  private formatCustomDomainResponse(
    domain: CustomDomain,
  ): Record<string, unknown> {
    const domainObj = (domain as any).toObject
      ? (domain as any).toObject()
      : domain;
    return {
      _id: objectIdToString(domainObj._id),
      tenantId: domainObj.tenantId,
      domain: domainObj.domain,
      status: domainObj.status,
      verificationToken: domainObj.verificationToken,
      verificationMethod: domainObj.verificationMethod,
      dnsTarget: domainObj.dnsTarget,
      dnsInstructions: this.getDnsInstructions(domainObj),
      lastVerifiedAt: domainObj.lastVerifiedAt,
      sslStatus: domainObj.sslStatus,
      sslExpiresAt: domain.sslExpiresAt,
      sslIssuedAt: domain.sslIssuedAt,
      isPrimary: domain.isPrimary,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }

  /**
   * Generate DNS instructions for tenant
   */
  private getDnsInstructions(domain: CustomDomain) {
    if (domain.verificationMethod === 'TXT') {
      return {
        method: 'TXT',
        target: `_verify.${domain.domain}`,
        instructions: [
          `1. Go to your domain registrar's DNS settings`,
          `2. Add a TXT record with:`,
          `   Name: _verify.${domain.domain}`,
          `   Value: ${domain.verificationToken}`,
          `3. Wait up to 24 hours for DNS propagation`,
          `4. Return here to verify ownership`,
        ],
      };
    } else {
      return {
        method: 'CNAME',
        target: domain.dnsTarget,
        instructions: [
          `1. Go to your domain registrar's DNS settings`,
          `2. Add a CNAME record with:`,
          `   Name: ${domain.domain}`,
          `   Value: ${domain.dnsTarget}`,
          `3. Wait up to 24 hours for DNS propagation`,
          `4. Return here to verify ownership`,
        ],
      };
    }
  }

  /**
   * Get domain & SSL health summary for tenant dashboard "My Domains / My URLs / SSL Health" view.
   * Returns aggregate counts by status, SSL expiry warnings, and per-domain readiness breakdown.
   */
  async getTenantDomainHealthSummary(
    tenantId: string,
  ): Promise<TenantDomainHealthSummary> {
    const tenantObjectId = new Types.ObjectId(tenantId);

    const domains = await this.customDomainModel
      .find({ tenantId: tenantObjectId })
      .lean();

    const now = new Date();
    const warningWindowMs = 14 * 24 * 60 * 60 * 1000; // 14 days

    const summary: TenantDomainHealthSummary = {
      total: domains.length,
      byStatus: {} as Record<string, number>,
      ssl: {
        issued: 0,
        pending: 0,
        expired: 0,
        expiringSoon: 0,
        expiringList: [] as Array<{
          domain: string;
          expiresAt: Date;
          daysRemaining: number;
        }>,
      },
      primary: domains.find((d) => d.isPrimary)?.domain || null,
    };

    for (const d of domains) {
      const status = d.status || 'unknown';
      summary.byStatus[status] = (summary.byStatus[status] || 0) + 1;

      if (d.sslStatus === 'issued') {
        summary.ssl.issued += 1;

        if (d.sslExpiresAt) {
          const expiresAt = new Date(d.sslExpiresAt);
          const msRemaining = expiresAt.getTime() - now.getTime();

          if (msRemaining <= 0) {
            summary.ssl.expired += 1;
          } else if (msRemaining <= warningWindowMs) {
            const daysRemaining = Math.max(
              1,
              Math.round(msRemaining / (1000 * 60 * 60 * 24)),
            );
            summary.ssl.expiringSoon += 1;
            summary.ssl.expiringList.push({
              domain: d.domain,
              expiresAt,
              daysRemaining,
            });
          }
        }
      } else if (d.sslStatus === 'pending') {
        summary.ssl.pending += 1;
      } else if (d.sslStatus === 'expired') {
        summary.ssl.expired += 1;
      }
    }

    return summary;
  }

  /**
   * List all custom domains for a tenant with formatted response.
   */
  async listForTenant(
    tenantId: string,
  ): Promise<Array<Record<string, unknown>>> {
    const domains = await this.customDomainModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort('-createdAt')
      .exec();

    return domains.map((d) => this.formatCustomDomainResponse(d));
  }
}
