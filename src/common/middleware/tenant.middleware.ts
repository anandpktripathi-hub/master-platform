import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * TenantMiddleware
 * 
 * This middleware runs AFTER JWT authentication (if present) and ensures that
 * tenantId is available on the request object for downstream use.
 * 
 * Flow:
 * 1. JWT authentication middleware runs first (passport-jwt)
 * 2. JWT strategy validates token and attaches user to req.user (includes tenantId)
 * 3. This middleware extracts tenantId from req.user and attaches to req.tenantId
 * 4. TenantGuard later validates tenantId exists for protected routes
 * 
 * Note: This middleware does NOT enforce authentication - it just makes tenantId
 * available if a user is authenticated. Use JwtAuthGuard for authentication.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  use(
    req: Request & { 
      user?: any; 
      tenantId?: string;
      resolvedTenantId?: string;
      resolvedTenantSlug?: string;
      isLandlordDomain?: boolean;
    }, 
    res: Response, 
    next: NextFunction
  ) {
    // Priority 1: If user is authenticated via JWT, extract tenantId from JWT
    if (req.user && req.user.tenantId) {
      req.tenantId = req.user.tenantId;
      
      // Log tenant context for debugging (can be removed in production)
      this.logger.debug(`Tenant context from JWT: ${req.tenantId} for user: ${req.user.email || req.user.userId}`);
    }
    // Priority 2: If no JWT but domain was resolved, use domain-based tenantId
    else if (req.resolvedTenantId && !req.isLandlordDomain) {
      req.tenantId = req.resolvedTenantId;
      
      this.logger.debug(`Tenant context from domain: ${req.tenantId} (slug: ${req.resolvedTenantSlug})`);
    }

    // For unauthenticated requests to landlord domain, tenantId will be undefined
    // This is expected for public routes like /health, /auth/login, etc.
    
    next();
  }
}
