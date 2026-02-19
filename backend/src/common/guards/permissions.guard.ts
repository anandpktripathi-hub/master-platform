import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import type { Permission } from '../enums/permission.enum';

type RequestUser = {
  role?: string;
  permissions?: string[];
};

function isPrivilegedRole(role?: string): boolean {
  if (!role) return false;

  const normalized = role.trim();
  return (
    normalized === 'PLATFORM_SUPER_ADMIN' ||
    normalized === 'platform_admin' ||
    normalized === 'PLATFORM_SUPERADMIN' ||
    normalized === 'TENANT_ADMIN' ||
    normalized === 'tenant_admin' ||
    normalized === 'OWNER' ||
    normalized === 'owner' ||
    normalized === 'ADMIN' ||
    normalized === 'admin'
  );
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No permissions required -> allow (JwtAuthGuard/RolesGuard can still protect)
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = request.user;

    // Fail closed if no user
    if (!user) return false;

    // Privileged roles bypass explicit permission checks
    if (isPrivilegedRole(user.role)) return true;

    const userPermissions = Array.isArray(user.permissions)
      ? user.permissions
      : [];
    if (userPermissions.length === 0) return false;

    // Require ALL declared permissions for the route
    return required.every((p) => userPermissions.includes(String(p)));
  }
}
