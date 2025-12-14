import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContextService } from '../services/tenant-context.service';

/**
 * TenantContextMiddleware
 * 
 * This middleware populates the TenantContextService with tenant information
 * from the authenticated user. This allows services to use dependency injection
 * to access tenant context instead of passing tenantId through method parameters.
 * 
 * This runs AFTER TenantMiddleware and requires TenantContextService to be
 * provided as a REQUEST-scoped service.
 */
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private readonly tenantContext: TenantContextService) {}

  use(req: Request & { user?: any; tenantId?: string }, res: Response, next: NextFunction) {
    // If user is authenticated and has tenantId, populate the context service
    if (req.user && req.user.tenantId) {
      this.tenantContext.setContext(
        req.user.tenantId,
        req.user.userId,
        req.user.role,
      );
    }

    next();
  }
}
