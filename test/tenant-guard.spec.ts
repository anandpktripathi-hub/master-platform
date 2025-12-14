import { Test, TestingModule } from '@nestjs/testing';
import { TenantGuard } from '../src/common/guards/tenant.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('TenantGuard', () => {
  let guard: TenantGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantGuard],
    }).compile();

    guard = module.get<TenantGuard>(TenantGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    const createMockContext = (user: any): ExecutionContext => ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as any);

    it('should allow PLATFORM_SUPER_ADMIN without tenantId', () => {
      const context = createMockContext({
        userId: 'admin-123',
        email: 'admin@platform.com',
        role: 'PLATFORM_SUPER_ADMIN',
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow PLATFORM_SUPER_ADMIN with tenantId', () => {
      const context = createMockContext({
        userId: 'admin-123',
        email: 'admin@platform.com',
        role: 'PLATFORM_SUPER_ADMIN',
        tenantId: 'tenant-1',
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow TENANT_OWNER with valid tenantId', () => {
      const context = createMockContext({
        userId: 'user-123',
        email: 'owner@tenant1.com',
        role: 'TENANT_OWNER',
        tenantId: 'tenant-1',
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow TENANT_ADMIN with valid tenantId', () => {
      const context = createMockContext({
        userId: 'user-456',
        email: 'admin@tenant1.com',
        role: 'TENANT_ADMIN',
        tenantId: 'tenant-1',
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow TENANT_USER with valid tenantId', () => {
      const context = createMockContext({
        userId: 'user-789',
        email: 'user@tenant1.com',
        role: 'TENANT_USER',
        tenantId: 'tenant-1',
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should reject request with no user', () => {
      const context = createMockContext(null);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('Authentication required');
    });

    it('should reject TENANT_OWNER without tenantId', () => {
      const context = createMockContext({
        userId: 'user-123',
        email: 'owner@tenant1.com',
        role: 'TENANT_OWNER',
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('Tenant context is required');
    });

    it('should reject TENANT_ADMIN without tenantId', () => {
      const context = createMockContext({
        userId: 'user-456',
        email: 'admin@tenant1.com',
        role: 'TENANT_ADMIN',
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should reject TENANT_USER without tenantId', () => {
      const context = createMockContext({
        userId: 'user-789',
        email: 'user@tenant1.com',
        role: 'TENANT_USER',
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should attach tenantId to request', () => {
      const mockRequest = {
        user: {
          userId: 'user-123',
          tenantId: 'tenant-1',
          role: 'TENANT_OWNER',
        },
      };

      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as any;

      guard.canActivate(context);

      expect((mockRequest as any)['tenantId']).toBe('tenant-1');
    });
  });
});
