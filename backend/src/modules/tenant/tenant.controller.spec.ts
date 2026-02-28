import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';

describe('TenantController', () => {
  let controller: TenantController;

  const tenantService = {
    getCurrentTenant: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TenantController],
      providers: [{ provide: TenantService, useValue: tenantService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(TenantController);
    jest.clearAllMocks();
  });

  it('throws when tenantId missing', async () => {
    await expect(controller.current(undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(tenantService.getCurrentTenant).not.toHaveBeenCalled();
  });

  it('throws when tenant not found', async () => {
    tenantService.getCurrentTenant.mockResolvedValue(null);

    await expect(
      controller.current('507f1f77bcf86cd799439011'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns tenant payload', async () => {
    tenantService.getCurrentTenant.mockResolvedValue({ _id: 't1' });

    const res = await controller.current('507f1f77bcf86cd799439011');

    expect(tenantService.getCurrentTenant).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
    );
    expect(res).toEqual({ tenant: { _id: 't1' } });
  });
});
