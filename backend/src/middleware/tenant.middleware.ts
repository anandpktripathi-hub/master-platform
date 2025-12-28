import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request as ExpressRequest, Response, NextFunction } from 'express';

// Extend Express Request to include 'tenant' property
export interface TenantRequest extends ExpressRequest {
  tenant?: any;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private tenantCache: Map<string, any> = new Map();

  async use(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      let tenant: any;
      if (req.headers['x-tenant-id']) {
        tenant = await this.resolveTenantByHost(
          req.headers['x-tenant-id'] as string,
        );
      } else if (req.path.startsWith('/tenant/')) {
        tenant = this.resolveTenantByPath(req.path);
      }
      if (!tenant) throw new BadRequestException('Tenant not found');
      req.tenant = tenant;
      this.cacheResult(tenant);
      next();
    } catch (err) {
      next(err);
    }
  }

  private async resolveTenantByHost(host: string): Promise<any> {
    // Simulate async DB lookup
    if (this.tenantCache.has(host)) return this.tenantCache.get(host);
    // ...fetch from DB or service...
    const tenant = { id: host, name: `Tenant for ${host}` };
    this.tenantCache.set(host, tenant);
    return tenant;
  }

  private resolveTenantByPath(path: string): any {
    // Extract tenant from path, e.g. /tenant/:tenantId/...
    const match = path.match(/^\/tenant\/([^/]+)/);
    if (match) {
      const tenantId = match[1];
      if (this.tenantCache.has(tenantId)) return this.tenantCache.get(tenantId);
      const tenant = { id: tenantId, name: `Tenant for ${tenantId}` };
      this.tenantCache.set(tenantId, tenant);
      return tenant;
    }
    return null;
  }

  private cacheResult(tenant: any) {
    if (tenant && tenant.id) {
      this.tenantCache.set(tenant.id, tenant);
    }
  }
}
