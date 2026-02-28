import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CouponController } from './coupons.controller';
import { CouponService } from './services/coupon.service';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceGuard } from '../../guards/workspace.guard';
import { RoleGuard } from '../../guards/role.guard';
import {
  ApplyCouponDto,
  BulkUpdateCouponStatusDto,
  ValidateCouponDto,
} from './dto/coupon-actions.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';

describe('CouponController', () => {
  let controller: CouponController;

  const couponService = {
    validateCoupon: jest.fn().mockResolvedValue({ valid: true }),
    applyCoupon: jest.fn().mockResolvedValue({ applied: true }),
    listCoupons: jest.fn().mockResolvedValue({ items: [], total: 0 }),
    createCoupon: jest.fn().mockResolvedValue({ _id: 'c1' }),
    updateCoupon: jest.fn().mockResolvedValue({ _id: 'c1', status: 'active' }),
    deleteCoupon: jest.fn().mockResolvedValue(undefined),
    getCouponStats: jest.fn().mockResolvedValue({ uses: 0 }),
    bulkUpdateStatus: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CouponController],
      providers: [{ provide: CouponService, useValue: couponService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(CouponController);
    jest.clearAllMocks();
  });

  it('validateCoupon rejects when user missing', async () => {
    const dto = Object.assign(new ValidateCouponDto(), {
      code: 'SAVE10',
      packageId: 'p1',
    });

    await expect(
      controller.validateCoupon({} as unknown as RequestWithUser, 't1', dto),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(couponService.validateCoupon).not.toHaveBeenCalled();
  });

  it('validateCoupon rejects when tenant missing', async () => {
    const dto = Object.assign(new ValidateCouponDto(), {
      code: 'SAVE10',
      packageId: 'p1',
    });

    await expect(
      controller.validateCoupon(
        { user: { sub: 'u1' } } as unknown as RequestWithUser,
        undefined,
        dto,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(couponService.validateCoupon).not.toHaveBeenCalled();
  });

  it('validateCoupon passes code, tenantId, and optional packageId', async () => {
    const dto = Object.assign(new ValidateCouponDto(), {
      code: 'SAVE10',
      packageId: 'p1',
    });

    await controller.validateCoupon(
      { user: { sub: 'u1' } } as unknown as RequestWithUser,
      '507f1f77bcf86cd799439011',
      dto,
    );

    expect(couponService.validateCoupon).toHaveBeenCalledWith(
      'SAVE10',
      '507f1f77bcf86cd799439011',
      'p1',
    );
  });

  it('applyCoupon passes code, tenantId, and checkout context', async () => {
    const dto = Object.assign(new ApplyCouponDto(), { code: 'SAVE10' });

    await controller.applyCoupon(
      { user: { sub: 'u1' } } as unknown as RequestWithUser,
      '507f1f77bcf86cd799439011',
      dto,
    );

    expect(couponService.applyCoupon).toHaveBeenCalledWith(
      'SAVE10',
      '507f1f77bcf86cd799439011',
      'checkout',
    );
  });

  it('listCoupons parses limit/skip and forwards status', async () => {
    await controller.listCoupons('active', '10', '5');

    expect(couponService.listCoupons).toHaveBeenCalledWith({
      status: 'active',
      limit: 10,
      skip: 5,
    });
  });

  it('createCoupon rejects when userId missing', async () => {
    const dto = Object.assign(new CreateCouponDto(), { code: 'A' });
    await expect(
      controller.createCoupon({ user: {} } as unknown as RequestWithUser, dto),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(couponService.createCoupon).not.toHaveBeenCalled();
  });

  it('createCoupon forwards dto and userId', async () => {
    const dto = Object.assign(new CreateCouponDto(), { code: 'SAVE10' });
    await controller.createCoupon(
      {
        user: { sub: '507f1f77bcf86cd799439012' },
      } as unknown as RequestWithUser,
      dto,
    );

    expect(couponService.createCoupon).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'SAVE10' }),
      '507f1f77bcf86cd799439012',
    );
  });

  it('activateCoupon calls updateCoupon with active status', async () => {
    await controller.activateCoupon(
      {
        user: { sub: '507f1f77bcf86cd799439012' },
      } as unknown as RequestWithUser,
      'c1',
    );

    expect(couponService.updateCoupon).toHaveBeenCalledWith(
      'c1',
      { status: 'active' },
      '507f1f77bcf86cd799439012',
    );
  });

  it('bulkUpdateCoupons forwards ids, status, and userId', async () => {
    const dto = Object.assign(new BulkUpdateCouponStatusDto(), {
      couponIds: ['c1', 'c2'],
      status: 'inactive' as const,
    });

    await controller.bulkUpdateCoupons(
      {
        user: { sub: '507f1f77bcf86cd799439012' },
      } as unknown as RequestWithUser,
      dto,
    );

    expect(couponService.bulkUpdateStatus).toHaveBeenCalledWith(
      ['c1', 'c2'],
      'inactive',
      '507f1f77bcf86cd799439012',
    );
  });
});
