import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import { PackageController } from './packages.controller';
import { PackageService } from './services/package.service';
import { PaymentGatewayService } from '../payments/services/payment-gateway.service';
import { PaymentLogService } from '../payments/services/payment-log.service';
import { BillingNotificationService } from '../billing/billing-notification.service';
import { TenantsService } from '../tenants/tenants.service';

type AuthRequest = Request & {
  user?: {
    sub?: string;
    tenantId?: string;
  };
};

describe('PackageController', () => {
  let controller: PackageController;

  const packageService = {
    getTenantPackage: jest.fn().mockResolvedValue({}),
    getUsageAndLimits: jest.fn().mockResolvedValue({}),
    canUseFeature: jest.fn().mockResolvedValue(true),
    listPackages: jest.fn().mockResolvedValue({ items: [] }),
    createPackage: jest.fn().mockResolvedValue({ id: 'p1' }),
    updatePackage: jest.fn().mockResolvedValue({ id: 'p1' }),
    deletePackage: jest.fn().mockResolvedValue(undefined),
    getPackage: jest.fn().mockResolvedValue({ id: 'p1' }),
    assignPackageToTenant: jest.fn().mockResolvedValue({ ok: true }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PackageController],
      providers: [
        { provide: PackageService, useValue: packageService },
        { provide: PaymentGatewayService, useValue: {} },
        { provide: PaymentLogService, useValue: {} },
        { provide: BillingNotificationService, useValue: {} },
        { provide: TenantsService, useValue: {} },
      ],
    }).compile();

    controller = moduleRef.get(PackageController);
    jest.clearAllMocks();
  });

  it('getTenantPackage rejects when user missing', async () => {
    await expect(
      controller.getTenantPackage({} as unknown as AuthRequest),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(packageService.getTenantPackage).not.toHaveBeenCalled();
  });

  it('listPackages forwards parsed limit/skip', async () => {
    await controller.listPackages('10', '5');

    expect(packageService.listPackages).toHaveBeenCalledWith({
      isActive: true,
      limit: 10,
      skip: 5,
    });
  });

  it('createPackage rejects when userId missing', async () => {
    await expect(
      controller.createPackage({ user: {} } as unknown as AuthRequest, {
        name: 'Basic',
        price: 0,
        billingCycle: 'monthly',
        featureSet: { api: true } as any,
        limits: { maxDomains: 1 } as any,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(packageService.createPackage).not.toHaveBeenCalled();
  });

  it('assignPackage rejects when tenantId missing', async () => {
    await expect(
      controller.assignPackage(
        { user: { sub: 'u1' } } as unknown as AuthRequest,
        '507f1f77bcf86cd799439011',
        {} as any,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(packageService.assignPackageToTenant).not.toHaveBeenCalled();
  });
});
