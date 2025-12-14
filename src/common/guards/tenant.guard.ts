import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';

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
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    // User must be authenticated
    if (!user) {
      this.logger.warn('TenantGuard: No user found on request. Ensure JwtAuthGuard runs before TenantGuard.');
      throw new ForbiddenException('Authentication required');
    }

    // PLATFORM_SUPER_ADMIN bypasses tenant isolation
    if (user.role === 'PLATFORM_SUPER_ADMIN') {
      this.logger.debug(`TenantGuard: PLATFORM_SUPER_ADMIN ${user.email} bypassing tenant check`);
      return true;
    }

    // All other users MUST have a tenantId
    if (!user.tenantId) {
      this.logger.error(`TenantGuard: User ${user.email || user.userId} has no tenantId in JWT token`);
      throw new ForbiddenException('Tenant context is required. Invalid JWT token.');
    }

    // Attach tenantId to request for downstream use (redundant with middleware, but safe)
    req.tenantId = user.tenantId;

    this.logger.debug(`TenantGuard: Validated tenant ${user.tenantId} for user ${user.email || user.userId}`);
    return true;
  }
}
