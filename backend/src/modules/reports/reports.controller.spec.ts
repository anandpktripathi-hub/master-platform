import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';

type AuthRequest = Request & {
  user?: { tenantId?: string };
};

describe('ReportsController', () => {
  let controller: ReportsController;

  const reportsService = {
    getTenantFinancialReport: jest.fn().mockResolvedValue({}),
    getTenantCommerceReport: jest.fn().mockResolvedValue({}),
    getTenantTrafficReport: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [{ provide: ReportsService, useValue: reportsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(ReportsController);
    jest.clearAllMocks();
  });

  it('rejects when tenantId missing', async () => {
    await expect(
      controller.getTenantFinancial({ user: {} } as unknown as AuthRequest),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(reportsService.getTenantFinancialReport).not.toHaveBeenCalled();
  });

  it('forwards tenantId to service (financial)', async () => {
    await controller.getTenantFinancial({
      user: { tenantId: 't1' },
    } as unknown as AuthRequest);

    expect(reportsService.getTenantFinancialReport).toHaveBeenCalledWith('t1');
  });

  it('forwards tenantId to service (commerce)', async () => {
    await controller.getTenantCommerce({
      user: { tenantId: 't1' },
    } as unknown as AuthRequest);

    expect(reportsService.getTenantCommerceReport).toHaveBeenCalledWith('t1');
  });
});
