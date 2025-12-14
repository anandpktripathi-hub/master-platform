import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
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
