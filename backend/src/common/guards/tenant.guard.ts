import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest() as any;

    const headerTenantRaw =
      (request.headers?.['x-tenant-id'] as string | undefined) ||
      (request.headers?.['x-workspace-id'] as string | undefined);

    // Prefer already-resolved tenantId from middleware/WorkspaceGuard.
    // This covers the case where the header contains a domain/slug and
    // TenantMiddleware resolved it to an ObjectId.
    let tenantId: string | undefined =
      (request.tenantId as string | undefined) ||
      (request.workspaceId as string | undefined);

    if (!tenantId && headerTenantRaw) {
      if (!Types.ObjectId.isValid(headerTenantRaw) && request.tenantId) {
        tenantId = String(request.tenantId);
      } else {
        tenantId = String(headerTenantRaw);
      }
    }

    if (!tenantId && request.user?.tenantId) {
      tenantId = String(request.user.tenantId);
    }

    if (!tenantId) {
      throw new ForbiddenException('Tenant/workspace context is required');
    }

    // Normalize onto request so downstream code can rely on it.
    request.tenantId = tenantId;
    request.workspaceId = request.workspaceId || tenantId;

    // Backward compatible: many controllers/services read req.user.tenantId.
    if (request.user && !request.user.tenantId) {
      request.user.tenantId = tenantId;
    }

    return true;
  }
}
