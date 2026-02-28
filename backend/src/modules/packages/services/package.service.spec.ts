import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { PackageService } from './package.service';
import { AuditLogService } from '../../../services/audit-log.service';

type QueryMock = {
  limit: jest.Mock;
  skip: jest.Mock;
  sort: jest.Mock;
  exec: jest.Mock;
};

type ServiceMocks = {
  packageModel: Record<string, unknown>;
  tenantPackageModel: Record<string, unknown>;
  tenantModel: Record<string, unknown>;
  auditLogService: Record<string, unknown>;
  packageQuery: QueryMock;
};

type CreateServiceOverrides = Partial<{
  packageModel: unknown;
  tenantPackageModel: unknown;
  tenantModel: unknown;
  auditLogService: unknown;
}>;

describe('PackageService', () => {
  const createService = async (overrides?: CreateServiceOverrides) => {
    const packageQuery: QueryMock = {
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };

    const packageModel =
      (overrides?.packageModel as Record<string, unknown> | undefined) ??
      ({
        find: jest.fn().mockReturnValue(packageQuery),
        countDocuments: jest.fn().mockResolvedValue(0),
        findById: jest.fn(),
        findOne: jest.fn(),
        deleteOne: jest.fn(),
      } satisfies Record<string, unknown>);

    const tenantPackageModel =
      (overrides?.tenantPackageModel as Record<string, unknown> | undefined) ??
      ({
        findOne: jest.fn(),
        countDocuments: jest.fn(),
      } satisfies Record<string, unknown>);

    const tenantModel =
      (overrides?.tenantModel as Record<string, unknown> | undefined) ??
      ({
        findById: jest.fn(),
        updateOne: jest.fn(),
      } satisfies Record<string, unknown>);

    const auditLogService =
      (overrides?.auditLogService as Record<string, unknown> | undefined) ??
      ({
        log: jest.fn().mockResolvedValue(undefined),
      } satisfies Record<string, unknown>);

    const moduleRef = await Test.createTestingModule({
      providers: [
        PackageService,
        { provide: getModelToken('Package'), useValue: packageModel },
        {
          provide: getModelToken('TenantPackage'),
          useValue: tenantPackageModel,
        },
        { provide: getModelToken('Tenant'), useValue: tenantModel },
        { provide: AuditLogService, useValue: auditLogService },
      ],
    }).compile();

    return {
      service: moduleRef.get(PackageService),
      mocks: {
        packageModel,
        tenantPackageModel,
        tenantModel,
        auditLogService,
        packageQuery,
      } satisfies ServiceMocks,
    };
  };

  it('throws BadRequestException for invalid tenantId (getTenantPackage)', async () => {
    const { service } = await createService();

    await expect(service.getTenantPackage('undefined')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('normalizes NaN limit/skip (listPackages)', async () => {
    const { service, mocks } = await createService();

    await service.listPackages({
      isActive: true,
      limit: Number.NaN,
      skip: Number.NaN,
    });

    expect(mocks.packageQuery.limit).toHaveBeenCalledWith(50);
    expect(mocks.packageQuery.skip).toHaveBeenCalledWith(0);
  });

  it('throws BadRequestException for invalid tenantId (assignPackageToTenant)', async () => {
    const { service } = await createService();

    await expect(
      service.assignPackageToTenant('undefined', '507f1f77bcf86cd799439011'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequestException for invalid packageId (getPackage)', async () => {
    const { service } = await createService();

    await expect(service.getPackage('not-an-objectid')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
