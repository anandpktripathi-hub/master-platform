import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request as ExpressRequest, Response, NextFunction } from 'express';
import { TenantsService } from '../modules/tenants/tenants.service';

// Extend Express Request to include 'tenant' property
export interface TenantRequest extends ExpressRequest {
  tenant?: any;
  tenantId?: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private tenantCache: Map<string, { tenant: any; expiresAt: number }> =
    new Map();
  private readonly cacheTtlMs = Number(
    process.env.TENANT_CACHE_TTL_MS || 5 * 60 * 1000,
  );

  constructor(private readonly tenantsService: TenantsService) {}

  async use(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const headerTenantRaw =
        (req.headers['x-tenant-id'] as string | string[] | undefined) ||
        (req.headers['x-workspace-id'] as string | string[] | undefined);
      const headerTenant = Array.isArray(headerTenantRaw)
        ? headerTenantRaw[0]
        : headerTenantRaw;

      const hostRaw =
        (req.headers['x-tenant-host'] as string | undefined) ||
        (req.headers.host as string | undefined) ||
        (req.hostname as string | undefined);

      const cacheKey = headerTenant
        ? `id:${String(headerTenant)}`
        : hostRaw
          ? `host:${String(hostRaw)}`
          : '';

      const cached = cacheKey ? this.getCached(cacheKey) : null;
      if (cached) {
        req.tenant = cached;
        req.tenantId = String(cached._id || cached.id);
        return next();
      }

      let tenant: any | null = null;

      if (headerTenant) {
        // Header is treated as tenant/workspace id.
        tenant = await this.tenantsService.resolveTenantById(
          String(headerTenant),
        );

        // If the header isn't an ObjectId, allow domain/slug resolution.
        if (!tenant) {
          tenant = await this.tenantsService.resolveTenantByHost(
            String(headerTenant),
          );
        }
      } else if (hostRaw) {
        tenant = await this.tenantsService.resolveTenantByHost(String(hostRaw));
      }

      if (!tenant) {
        throw new BadRequestException(
          'Tenant context missing or invalid. Provide x-tenant-id (or x-workspace-id) header.',
        );
      }

      const tenantId = String((tenant as any)._id || (tenant as any).id);
      req.tenantId = tenantId;
      // Backward-compatible shape used by some controllers
      req.tenant = { ...tenant, id: tenantId };
      if (cacheKey) {
        this.setCached(cacheKey, req.tenant);
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  private getCached(cacheKey: string): any | null {
    const cached = this.tenantCache.get(cacheKey);
    if (!cached) return null;
    if (cached.expiresAt <= Date.now()) {
      this.tenantCache.delete(cacheKey);
      return null;
    }
    return cached.tenant;
  }

  private setCached(cacheKey: string, tenant: any) {
    this.tenantCache.set(cacheKey, {
      tenant,
      expiresAt: Date.now() + this.cacheTtlMs,
    });
  }
}
