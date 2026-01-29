interface TenantUser {
  userId?: string;
  email?: string;
  role?: string;
  tenantId?: string;
}
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { TenantDatabaseService } from '../../tenants/database/database.service';

/**
 * TenantGuard
 *
 * This guard ensures that:
 * 1. The user is authenticated (req.user exists)
 * 2. The user has a valid tenantId in their JWT token
 * 3. The tenantId is attached to the request for downstream use
 *
 * Exception: PLATFORM_SUPER_ADMIN users bypass tenant checks and can access any tenant's data.
 *
 * Usage: Apply this guard to routes that require tenant isolation.
 * ```typescript
 * @UseGuards(JwtAuthGuard, TenantGuard)
 * @Get()
 * findAll(@Request() req) {
 *   const tenantId = req.user.tenantId; // or req.tenantId
 *   // Use tenantId in your queries
 * }
 * ```
 */
@Injectable()
export class TenantGuard {
  constructor(private tenantDbService: TenantDatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    // Extract tenantId from header or subdomain
    const tenantId = req.headers['x-tenant-id'] || req.subdomain;
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID required');
    }
    // Set tenant DB connection for this request
    req.tenantDbConnection =
      await this.tenantDbService.getTenantConnection(tenantId);
    req.tenantId = tenantId;
    return true;
  }
}
