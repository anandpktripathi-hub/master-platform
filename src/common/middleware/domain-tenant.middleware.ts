import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantResolverService } from '../services/tenant-resolver.service';

/**
 * DomainTenantMiddleware
 *
 * This middleware resolves the tenant from the request hostname (domain/subdomain).
 * It runs BEFORE authentication and attaches tenant information to the request.
 *
 * Execution Flow:
 * 1. Extract hostname from request (req.hostname or req.headers.host)
 * 2. Use TenantResolverService to resolve tenant from hostname
 * 3. Attach tenant info to request:
 *    - req.resolvedTenant (full tenant object)
 *    - req.resolvedTenantId (tenant ID string)
 *    - req.resolvedTenantSlug (tenant slug)
 *    - req.isLandlordDomain (boolean flag)
 * 4. Continue to next middleware
 *
 * This middleware does NOT enforce authentication or authorization.
 * It only makes tenant context available based on the domain.
 *
 * Use Cases:
 * - Public pages that need to show tenant-specific branding before login
 * - Login pages that need to know which tenant the user is logging into
 * - API endpoints that need tenant context from domain (in addition to JWT)
 */
@Injectable()
export class DomainTenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(DomainTenantMiddleware.name);

  constructor(private readonly tenantResolver: TenantResolverService) {}

  async use(
    req: Request & {
      resolvedTenant?: any;
      resolvedTenantId?: string;
      resolvedTenantSlug?: string;
      isLandlordDomain?: boolean;
      domainResolutionMethod?: string;
    },
    res: Response,
    next: NextFunction,
  ) {
    try {
      // Extract hostname from request
      // req.hostname removes the port, req.headers.host includes the port
      const hostname = req.headers.host || req.hostname || 'localhost';

      this.logger.debug(`Processing request for hostname: ${hostname}`);

      // Resolve tenant from hostname
      const resolution = await this.tenantResolver.resolveTenant(hostname);

      // Attach resolution results to request
      req.resolvedTenant = resolution.tenant || undefined;
      req.resolvedTenantId = resolution.tenantId || undefined;
      req.resolvedTenantSlug = resolution.tenantSlug || undefined;
      req.isLandlordDomain = resolution.resolutionMethod === 'landlord';
      req.domainResolutionMethod = resolution.resolutionMethod;

      // Log resolution for debugging
      if (resolution.tenant) {
        this.logger.log(
          `Resolved tenant: ${resolution.tenant.name} (${resolution.resolutionMethod})`,
        );
      } else if (resolution.resolutionMethod === 'landlord') {
        this.logger.debug('Request to landlord domain');
      } else {
        this.logger.warn(`Tenant not found for hostname: ${hostname}`);
      }

      next();
    } catch (error) {
      this.logger.error(
        `Error in DomainTenantMiddleware: ${(error as Error).message}`,
        (error as Error).stack,
      );
      // Don't block the request, just continue without tenant resolution
      next();
    }
  }
}
