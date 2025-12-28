import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { ANY_PERMISSIONS_KEY } from '../decorators/any-permissions.decorator';
import { ROLE_PERMISSIONS } from '../constants/role-permissions.map';
import { Role } from '../enums/role.enum';
import { Permission } from '../enums/permission.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    const anyPermissions = this.reflector.getAllAndOverride<Permission[]>(
      ANY_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If neither @Permissions nor @AnyPermissions specified, allow
    if (
      (!requiredPermissions || requiredPermissions.length === 0) &&
      (!anyPermissions || anyPermissions.length === 0)
    ) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: { role?: Role } = request.user;
    if (!user) return false;

    const userRole: Role = user?.role as Role;

    // Super admin shortcut
    if (userRole === Role.PLATFORM_SUPER_ADMIN) return true;

    const granted = ROLE_PERMISSIONS[userRole] || [];

    // Check @Permissions (require all)
    if (requiredPermissions && requiredPermissions.length > 0) {
      if (!requiredPermissions.every((p) => granted.includes(p))) {
        return false;
      }
    }

    // Check @AnyPermissions (require at least one)
    if (anyPermissions && anyPermissions.length > 0) {
      if (!anyPermissions.some((p) => granted.includes(p))) {
        return false;
      }
    }

    return true;
  }
}
