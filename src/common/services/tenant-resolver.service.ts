import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant } from '../../modules/tenants/schemas/tenant.schema';

export interface TenantResolutionResult {
  tenant: Tenant | null;
  tenantId: string | null;
  tenantSlug: string | null;
  resolutionMethod: 'subdomain' | 'custom-domain' | 'landlord' | 'not-found';
  hostname: string;
}

/**
 * TenantResolverService
 * 
 * This service resolves which tenant a request belongs to based on the hostname.
 * 
 * Resolution Strategy:
 * 1. Check if hostname matches a custom domain (tenant.domain field)
 * 2. Check if hostname is a subdomain pattern: {slug}.{baseDomain}
 * 3. If neither, treat as landlord/platform domain
 * 
 * Examples:
 * - acme.myapp.com → Resolves to tenant with slug='acme'
 * - custom.com → Resolves to tenant with domain='custom.com'
 * - myapp.com or app.myapp.com → Landlord/platform domain (no tenant)
 */
@Injectable()
export class TenantResolverService {
  private readonly logger = new Logger(TenantResolverService.name);
  private readonly baseDomains: string[]; // e.g., ['localhost:3000', 'myapp.com', 'app.myapp.com']

  constructor(
    @InjectModel(Tenant.name) private readonly tenantModel: Model<Tenant>,
  ) {
    // Load base domains from environment or use defaults
    const baseDomainsEnv = process.env.BASE_DOMAINS || 'localhost:3000,localhost';
    this.baseDomains = baseDomainsEnv.split(',').map((d) => d.trim());
    
    this.logger.log(`TenantResolver initialized with base domains: ${this.baseDomains.join(', ')}`);
  }

  /**
   * Resolve tenant from hostname
   * 
   * @param hostname - The full hostname from the HTTP request (e.g., 'tenant1.myapp.com')
   * @returns TenantResolutionResult with tenant info or null if landlord domain
   */
  async resolveTenant(hostname: string): Promise<TenantResolutionResult> {
    const normalizedHostname = hostname.toLowerCase();
    
    this.logger.debug(`Resolving tenant for hostname: ${normalizedHostname}`);

    // Step 1: Check if this is a landlord/platform domain
    if (this.isLandlordDomain(normalizedHostname)) {
      this.logger.debug(`Hostname ${normalizedHostname} is a landlord domain`);
      return {
        tenant: null,
        tenantId: null,
        tenantSlug: null,
        resolutionMethod: 'landlord',
        hostname: normalizedHostname,
      };
    }

    // Step 2: Try to resolve by custom domain (exact match)
    const tenantByDomain = await this.tenantModel
      .findOne({ 
        domain: normalizedHostname,
        status: { $in: ['ACTIVE', 'TRIAL'] }, // Only active/trial tenants
      })
      .exec();

    if (tenantByDomain) {
      this.logger.log(`Resolved tenant ${tenantByDomain.name} by custom domain: ${normalizedHostname}`);
      return {
        tenant: tenantByDomain,
        tenantId: tenantByDomain._id.toString(),
        tenantSlug: tenantByDomain.slug,
        resolutionMethod: 'custom-domain',
        hostname: normalizedHostname,
      };
    }

    // Step 3: Try to resolve by subdomain pattern
    const slug = this.extractSubdomainSlug(normalizedHostname);
    if (slug) {
      const tenantBySlug = await this.tenantModel
        .findOne({ 
          slug,
          status: { $in: ['ACTIVE', 'TRIAL'] },
        })
        .exec();

      if (tenantBySlug) {
        this.logger.log(`Resolved tenant ${tenantBySlug.name} by subdomain slug: ${slug}`);
        return {
          tenant: tenantBySlug,
          tenantId: tenantBySlug._id.toString(),
          tenantSlug: tenantBySlug.slug,
          resolutionMethod: 'subdomain',
          hostname: normalizedHostname,
        };
      }
    }

    // Step 4: No tenant found
    this.logger.warn(`Could not resolve tenant for hostname: ${normalizedHostname}`);
    return {
      tenant: null,
      tenantId: null,
      tenantSlug: null,
      resolutionMethod: 'not-found',
      hostname: normalizedHostname,
    };
  }

  /**
   * Check if hostname is a landlord/platform domain (not a tenant domain)
   */
  private isLandlordDomain(hostname: string): boolean {
    // Check if hostname exactly matches any base domain
    if (this.baseDomains.includes(hostname)) {
      return true;
    }

    // Check for common landlord patterns
    const landlordPrefixes = ['app.', 'www.', 'admin.', 'api.'];
    for (const prefix of landlordPrefixes) {
      for (const baseDomain of this.baseDomains) {
        if (hostname === `${prefix}${baseDomain}`) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Extract subdomain slug from hostname
   * 
   * Examples:
   * - 'tenant1.myapp.com' with base 'myapp.com' → 'tenant1'
   * - 'tenant1.localhost:3000' with base 'localhost:3000' → 'tenant1'
   * - 'myapp.com' with base 'myapp.com' → null (no subdomain)
   */
  private extractSubdomainSlug(hostname: string): string | null {
    for (const baseDomain of this.baseDomains) {
      // Check if hostname ends with .{baseDomain}
      const pattern = `.${baseDomain}`;
      if (hostname.endsWith(pattern)) {
        const slug = hostname.substring(0, hostname.length - pattern.length);
        
        // Validate slug (alphanumeric + hyphens, no dots)
        if (slug && /^[a-z0-9-]+$/.test(slug)) {
          return slug;
        }
      }
    }

    return null;
  }

  /**
   * Validate if a slug is available for use
   */
  async isSlugAvailable(slug: string): Promise<boolean> {
    const existing = await this.tenantModel.findOne({ slug }).exec();
    return !existing;
  }

  /**
   * Validate if a custom domain is available for use
   */
  async isDomainAvailable(domain: string): Promise<boolean> {
    const existing = await this.tenantModel.findOne({ domain }).exec();
    return !existing;
  }
}
