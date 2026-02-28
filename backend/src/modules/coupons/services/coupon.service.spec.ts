import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CouponService } from './coupon.service';
import { Coupon } from '../../../database/schemas/coupon.schema';
import { CouponUsage } from '../../../database/schemas/coupon-usage.schema';
import { Package } from '../../../database/schemas/package.schema';
import { TenantPackage } from '../../../database/schemas/tenant-package.schema';
import { AuditLogService } from '../../../services/audit-log.service';

describe('CouponService', () => {
  let service: CouponService;

  const couponModelMock: any = {
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    find: jest.fn(),
    updateMany: jest.fn(),
  };
  const couponUsageModelMock: any = {
    countDocuments: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
  };
  const packageModelMock: any = {
    findById: jest.fn(),
  };
  const tenantPackageModelMock: any = {
    findOne: jest.fn(),
  };
  const auditLogServiceMock: Partial<AuditLogService> = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponService,
        { provide: getModelToken(Coupon.name), useValue: couponModelMock },
        { provide: getModelToken(CouponUsage.name), useValue: couponUsageModelMock },
        { provide: getModelToken(Package.name), useValue: packageModelMock },
        { provide: getModelToken(TenantPackage.name), useValue: tenantPackageModelMock },
        { provide: AuditLogService, useValue: auditLogServiceMock },
      ],
    }).compile();

    service = module.get(CouponService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('validateCoupon computes percent discount from package price', async () => {
    const tenantId = new Types.ObjectId().toHexString();
    const packageId = new Types.ObjectId().toHexString();
    const couponId = new Types.ObjectId();

    couponModelMock.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: couponId,
        code: 'SAVE10',
        status: 'active',
        type: 'multi',
        discountType: 'percent',
        amount: 10,
        validFrom: new Date(Date.now() - 1000),
        validTo: new Date(Date.now() + 60_000),
        maxUses: 0,
        maxUsesPerTenant: 0,
        isPrivate: false,
        allowedTenantIds: [],
        applicablePackageIds: [],
      }),
    });

    couponUsageModelMock.countDocuments.mockResolvedValue(0);

    packageModelMock.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: new Types.ObjectId(packageId),
        price: 1000,
      }),
    });

    const res = await service.validateCoupon('save10', tenantId, packageId);

    expect(res.valid).toBe(true);
    expect(res.discountType).toBe('percent');
    expect(res.discount).toBe(100);
    expect(res.couponId).toBe(String(couponId));
  });

  it('applyCoupon records usage after validation', async () => {
    const tenantId = new Types.ObjectId().toHexString();
    const packageId = new Types.ObjectId();
    const couponId = new Types.ObjectId();

    tenantPackageModelMock.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        tenantId: new Types.ObjectId(tenantId),
        packageId,
      }),
    });

    couponModelMock.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: couponId,
        code: 'FIX50',
        status: 'active',
        type: 'multi',
        discountType: 'fixed',
        amount: 50,
        validFrom: new Date(Date.now() - 1000),
        validTo: new Date(Date.now() + 60_000),
        maxUses: 0,
        maxUsesPerTenant: 0,
        isPrivate: false,
        allowedTenantIds: [],
        applicablePackageIds: [],
      }),
    });

    couponUsageModelMock.countDocuments.mockResolvedValue(0);

    packageModelMock.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        _id: packageId,
        price: 1000,
      }),
    });

    couponUsageModelMock.create.mockResolvedValue({});

    const res = await service.applyCoupon('fix50', tenantId, 'checkout');

    expect(res.couponId).toBe(String(couponId));
    expect(res.discount).toBe(50);
    expect(couponUsageModelMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        couponId,
        tenantId: new Types.ObjectId(tenantId),
        context: 'checkout',
        amountDiscounted: 50,
      }),
    );
  });

  it('applyCoupon rejects missing tenant package', async () => {
    const tenantId = new Types.ObjectId().toHexString();
    tenantPackageModelMock.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    await expect(service.applyCoupon('any', tenantId, 'checkout')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
