import { Injectable, Scope } from '@nestjs/common';

/**
 * TenantContextService
 * 
 * A request-scoped service that holds the current tenant's context.
 * This allows any service to access the current tenantId through dependency injection
 * without needing to pass it through multiple layers.
 * 
 * Usage in a service:
 * ```typescript
 * constructor(private readonly tenantContext: TenantContextService) {}
 * 
 * async someMethod() {
 *   const tenantId = this.tenantContext.getTenantId();
 *   // Use tenantId in your queries
 * }
 * ```
 * 
 * The service is REQUEST-scoped, meaning a new instance is created for each HTTP request.
 * This ensures tenant isolation even in concurrent requests.
 */
@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  private tenantId: string | null = null;
  private userId: string | null = null;
  private userRole: string | null = null;

  /**
   * Set the tenant context from the authenticated request
   */
  setContext(tenantId: string, userId?: string, userRole?: string) {
    this.tenantId = tenantId;
    this.userId = userId || null;
    this.userRole = userRole || null;
  }

  /**
   * Get the current tenant ID
   * @throws Error if tenantId is not set (should only happen on unauthenticated requests)
   */
  getTenantId(): string {
    if (!this.tenantId) {
      throw new Error('Tenant context not available. Make sure the request is authenticated.');
    }
    return this.tenantId;
  }

  /**
   * Get the current tenant ID or return null if not set
   * Use this for optional tenant context (e.g., public routes)
   */
  getTenantIdOrNull(): string | null {
    return this.tenantId;
  }

  /**
   * Get the current user ID
   */
  getUserId(): string | null {
    return this.userId;
  }

  /**
   * Get the current user role
   */
  getUserRole(): string | null {
    return this.userRole;
  }

  /**
   * Check if the current user is a platform super admin
   */
  isPlatformSuperAdmin(): boolean {
    return this.userRole === 'PLATFORM_SUPER_ADMIN';
  }

  /**
   * Check if tenant context is available
   */
  hasContext(): boolean {
    return this.tenantId !== null;
  }
}
