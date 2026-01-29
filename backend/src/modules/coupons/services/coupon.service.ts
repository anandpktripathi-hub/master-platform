import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Coupon,
  CouponDocument,
} from '../../../database/schemas/coupon.schema';
import {
  CouponUsage,
  CouponUsageDocument,
} from '../../../database/schemas/coupon-usage.schema';
import { AuditLogService } from '../../../services/audit-log.service';

@Injectable()
export class CouponService {
  private readonly logger = new Logger(CouponService.name);

  constructor(
    @InjectModel('Coupon') private readonly couponModel: Model<CouponDocument>,
    @InjectModel('CouponUsage')
    private readonly couponUsageModel: Model<CouponUsageDocument>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async createCoupon(createDto: any, userId?: string): Promise<Coupon> {
    // Implement coupon creation logic
    const coupon = new this.couponModel({ ...createDto, createdBy: userId });
    return coupon.save();
  }

  async updateCoupon(
    couponId: string,
    updateDto: any,
    userId?: string,
  ): Promise<Coupon> {
    const coupon = await this.couponModel
      .findByIdAndUpdate(
        couponId,
        { ...updateDto, updatedBy: userId },
        { new: true },
      )
      .exec();
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async deleteCoupon(couponId: string, userId?: string): Promise<void> {
    const coupon = await this.couponModel.findByIdAndDelete(couponId).exec();
    if (!coupon) throw new NotFoundException('Coupon not found');
    // Optionally log deletion
    return;
  }

  async listCoupons(params: {
    status?: string;
    limit?: number;
    skip?: number;
  }): Promise<Coupon[]> {
    const query: any = {};
    if (params.status) query.status = params.status;
    return this.couponModel
      .find(query)
      .limit(params.limit || 50)
      .skip(params.skip || 0)
      .exec();
  }

  async validateCoupon(
    code: string,
    tenantId: string,
    packageId?: string,
  ): Promise<any> {
    // Implement coupon validation logic
    const coupon = await this.couponModel.findOne({ code }).exec();
    if (!coupon) throw new NotFoundException('Coupon not found');
    // Check expiry
    const now = new Date();
    if (coupon.validTo && now > coupon.validTo) {
      // Mark as expired if not already
      if (coupon.status !== 'expired') {
        coupon.status = 'expired';
        await coupon.save();
      }
      return { valid: false, reason: 'Coupon expired', coupon };
    }
    if (coupon.status !== 'active') {
      return { valid: false, reason: 'Coupon not active', coupon };
    }
    // TODO: Check usage limits, applicable packages, allowed tenants, etc.
    return { valid: true, coupon };
  }

  async applyCoupon(
    code: string,
    tenantId: string,
    context: string,
  ): Promise<any> {
    // Implement coupon application logic
    const coupon = await this.couponModel
      .findOne({ code, status: 'active' })
      .exec();
    if (!coupon) throw new NotFoundException('Coupon not found or inactive');
    // Add application logic
    return { applied: true, coupon };
  }

  async getCouponStats(couponId: string): Promise<any> {
    // Implement coupon stats logic
    const usage = await this.couponUsageModel
      .find({ couponId: new Types.ObjectId(couponId) })
      .exec();
    return { stats: usage };
  }

  async bulkUpdateStatus(
    couponIds: string[],
    status: 'active' | 'inactive',
    userId?: string,
  ): Promise<void> {
    await this.couponModel
      .updateMany({ _id: { $in: couponIds } }, { status, updatedBy: userId })
      .exec();
    return;
  }
}
