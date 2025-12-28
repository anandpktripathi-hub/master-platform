import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../src/common/guards/roles.guard';
import { PermissionsGuard } from '../src/common/guards/permissions.guard';
import { TenantGuard } from '../src/common/guards/tenant.guard';
import { Role } from '../src/common/enums/role.enum';
import { Permission } from '../src/common/enums/permission.enum';

describe('RBAC Guards (Unit)', () => {
  describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    beforeEach(() => {
      reflector = new Reflector();
      guard = new RolesGuard(reflector);
    });

    it('should allow if no roles are required', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: { role: Role.CUSTOMER } }),
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValueOnce(undefined);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow if user role matches required role', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: { role: Role.PLATFORM_SUPER_ADMIN } }),
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as unknown as ExecutionContext;

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce([Role.PLATFORM_SUPER_ADMIN]);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should reject if user role does not match required role', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: { role: Role.CUSTOMER } }),
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as unknown as ExecutionContext;

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce([Role.PLATFORM_SUPER_ADMIN]);

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should reject if user is not present', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: null }),
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as unknown as ExecutionContext;

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValueOnce([Role.PLATFORM_SUPER_ADMIN]);

      expect(guard.canActivate(context)).toBe(false);
    });
  });

  describe('PermissionsGuard', () => {
    let guard: PermissionsGuard;
    let reflector: Reflector;

    beforeEach(() => {
      reflector = new Reflector();
      guard = new PermissionsGuard(reflector);
    });

    it('should allow if no permissions are required', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: { role: Role.TENANT_OWNER } }),
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as unknown as ExecutionContext;

      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow PLATFORM_SUPER_ADMIN regardless of permissions', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: { role: Role.PLATFORM_SUPER_ADMIN } }),
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as unknown as ExecutionContext;

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Permission.MANAGE_TENANTS]);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow if user role has required permission', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: { role: Role.TENANT_OWNER } }),
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as unknown as ExecutionContext;

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Permission.MANAGE_TENANT_PRODUCTS]);

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should reject if user role lacks required permission', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: { role: Role.CUSTOMER } }),
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as unknown as ExecutionContext;

      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([Permission.MANAGE_TENANT_PRODUCTS]);

      expect(guard.canActivate(context)).toBe(false);
    });
  });

  describe('TenantGuard', () => {
    let guard: TenantGuard;

    beforeEach(() => {
      guard = new TenantGuard();
    });

    it('should allow PLATFORM_SUPER_ADMIN without tenantId', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { role: Role.PLATFORM_SUPER_ADMIN, tenantId: null },
          }),
        }),
      } as unknown as ExecutionContext;

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow if user has tenantId', () => {
      const req = { user: { role: Role.TENANT_OWNER, tenantId: 'tenant-123' } };
      const context = {
        switchToHttp: () => ({
          getRequest: () => req,
        }),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(context);
      expect(result).toBe(true);
      expect((req as { tenantId?: string }).tenantId).toBe('tenant-123');
    });

    it('should reject if user is missing', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({ user: null }),
        }),
      } as unknown as ExecutionContext;

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should reject if user lacks tenantId and is not super admin', () => {
      const context = {
        switchToHttp: () => ({
          getRequest: () => ({
            user: { role: Role.TENANT_OWNER, tenantId: null },
          }),
        }),
      } as unknown as ExecutionContext;

      expect(guard.canActivate(context)).toBe(false);
    });
  });
});
