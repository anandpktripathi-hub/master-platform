import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

type TenantRequest = Request & { tenantId?: string };

export const Tenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<TenantRequest>();
    return request.tenantId;
  },
);

// Alias for clarity
export const CurrentTenant = Tenant;
