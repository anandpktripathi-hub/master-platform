import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Types } from 'mongoose';

type TenantRequest = Request & {
  tenantId?: string;
  user?: { tenantId?: string } | any;
};

export const Tenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<TenantRequest>();

    // 1) Highest priority: explicit workspace / tenant header
    const headerTenant =
      (request.headers['x-tenant-id'] as string | undefined) ||
      (request.headers['x-workspace-id'] as string | undefined);

    if (headerTenant) {
      // If a domain/slug is provided in the header, TenantMiddleware may have
      // already resolved it to an actual tenant ObjectId and set request.tenantId.
      // Prefer the resolved ObjectId to avoid downstream ObjectId validation errors.
      if (!Types.ObjectId.isValid(headerTenant) && request.tenantId) {
        return request.tenantId;
      }

      return headerTenant;
    }

    // 2) Middleware-populated tenantId (PathTenantMiddleware / TenantMiddleware)
    if (request.tenantId) {
      return request.tenantId;
    }

    // 3) Fallback: tenant from authenticated user payload
    if (request.user && request.user.tenantId) {
      return String(request.user.tenantId);
    }

    return undefined;
  },
);

// Alias for clarity
export const CurrentTenant = Tenant;
