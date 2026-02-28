import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

export const ROLES_KEY = 'roles';

// Canonical high-level roles used across the platform
// - PLATFORM_SUPER_ADMIN: SaaS/platform owner
// - TENANT_ADMIN: Company/tenant owner
// - STAFF: Internal staff/employee
// - CLIENT: External client/customer
type CanonicalRole =
  | 'PLATFORM_SUPER_ADMIN'
  | 'TENANT_ADMIN'
  | 'STAFF'
  | 'CLIENT';

function normalizeRole(rawRole?: string | null): CanonicalRole | null {
  if (!rawRole) return null;

  const role = rawRole.trim();

  // Platform/SaaS owner aliases
  if (
    role === 'PLATFORM_SUPER_ADMIN' ||
    role === 'PLATFORM_SUPERADMIN' ||
    role === 'platform_admin' ||
    role === 'PLATFORM_ADMIN_LEGACY'
  ) {
    return 'PLATFORM_SUPER_ADMIN';
  }

  // Tenant/company admin aliases
  if (
    role === 'TENANT_ADMIN' ||
    role === 'tenant_admin' ||
    role === 'TENANT_ADMIN_LEGACY' ||
    role === 'OWNER' ||
    role === 'owner' ||
    role === 'ADMIN' ||
    role === 'admin'
  ) {
    return 'TENANT_ADMIN';
  }

  // Client/customer aliases
  if (
    role === 'CLIENT' ||
    role === 'client' ||
    role === 'customer' ||
    role === 'CUSTOMER_LEGACY'
  ) {
    return 'CLIENT';
  }

  // Fallback: treat any other valid user role as STAFF
  return 'STAFF';
}

function normalizeRequiredRoles(
  required: string[] | undefined,
): CanonicalRole[] {
  if (!required || required.length === 0) return [];

  const mapped = required
    .map((r) => {
      const role = r.trim();

      if (
        role === 'PLATFORM_SUPER_ADMIN' ||
        role === 'PLATFORM_SUPERADMIN' ||
        role === 'platform_admin' ||
        role === 'PLATFORM_ADMIN_LEGACY'
      ) {
        return 'PLATFORM_SUPER_ADMIN' as const;
      }

      if (
        role === 'TENANT_ADMIN' ||
        role === 'tenant_admin' ||
        role === 'TENANT_ADMIN_LEGACY' ||
        role === 'OWNER' ||
        role === 'owner' ||
        role === 'ADMIN' ||
        role === 'admin'
      ) {
        return 'TENANT_ADMIN' as const;
      }

      if (
        role === 'CLIENT' ||
        role === 'client' ||
        role === 'customer' ||
        role === 'CUSTOMER_LEGACY'
      ) {
        return 'CLIENT' as const;
      }

      if (
        role === 'STAFF' ||
        role === 'staff' ||
        role === 'user' ||
        role === 'USER'
      ) {
        return 'STAFF' as const;
      }

      return undefined;
    })
    .filter((r): r is CanonicalRole => !!r);

  // If nothing could be normalized, keep empty to avoid accidental allow
  return mapped;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredRaw = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const required = normalizeRequiredRoles(requiredRaw);

    // If no roles metadata, allow (JwtAuthGuard still protects route)
    if (!required || required.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { role?: string } }>();

    const userRoleCanonical = normalizeRole(request.user?.role ?? null);

    if (!userRoleCanonical) {
      return false;
    }

    return required.includes(userRoleCanonical);
  }
}
