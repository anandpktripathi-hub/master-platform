import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
import { Package, PackageDocument } from '../../../database/schemas/package.schema';
import {
  TenantPackage,
  TenantPackageDocument,
} from '../../../database/schemas/tenant-package.schema';
import { AuditLogService } from '../../../services/audit-log.service';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';

@Injectable()
export class CouponService {
  private readonly logger = new Logger(CouponService.name);

  constructor(
    @InjectModel(Coupon.name) private readonly couponModel: Model<CouponDocument>,
    @InjectModel(CouponUsage.name)
    private readonly couponUsageModel: Model<CouponUsageDocument>,
    @InjectModel(Package.name) private readonly packageModel: Model<PackageDocument>,
    @InjectModel(TenantPackage.name)
    private readonly tenantPackageModel: Model<TenantPackageDocument>,
    private readonly auditLogService: AuditLogService,
  ) {}

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} must be a valid ObjectId`);
    }
    return new Types.ObjectId(value);
  }

  private normalizeCode(code: string): string {
    return (code || '').trim().toUpperCase();
  }

  private computeDiscount(
    coupon: Pick<Coupon, 'discountType' | 'amount'>,
    price: number,
  ): number {
    if (!Number.isFinite(price) || price < 0) {
      throw new BadRequestException('Package price is invalid');
    }

    const amount = Number(coupon.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Coupon amount is invalid');
    }

    if (coupon.discountType === 'fixed') {
      return Math.min(amount, price);
    }

    // percent
    const percent = amount;
    const discount = (price * percent) / 100;
    return Math.min(discount, price);
  }

  private mapCreateDtoToCoupon(createDto: CreateCouponDto, userId?: string) {
    const code = this.normalizeCode(createDto.code);
    const discountType = createDto.discountType ?? 'percent';
    const type = createDto.type ?? 'single';
    const amount = createDto.amount ?? createDto.discount;

    if (amount === undefined || amount === null) {
      throw new BadRequestException('amount (or legacy discount) is required');
    }

    const validFromRaw = createDto.validFrom;
    const validToRaw = createDto.validTo ?? createDto.expiryDate;

    const now = new Date();
    const validFrom = validFromRaw ? new Date(validFromRaw) : now;

    let validTo: Date;
    if (validToRaw) {
      validTo = new Date(validToRaw);
    } else {
      validTo = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    if (!(validFrom instanceof Date) || isNaN(validFrom.getTime())) {
      throw new BadRequestException('validFrom is invalid');
    }
    if (!(validTo instanceof Date) || isNaN(validTo.getTime())) {
      throw new BadRequestException('validTo/expiryDate is invalid');
    }
    if (validFrom > validTo) {
      throw new BadRequestException('validFrom must be before validTo');
    }

    const maxUses = createDto.maxUses ?? createDto.usageLimit ?? 0;
    const maxUsesPerTenant = createDto.maxUsesPerTenant ?? 0;

    const applicablePackageIds = (createDto.applicablePackageIds ?? []).map(
      (id) => this.toObjectId(id, 'applicablePackageIds'),
    );

    const allowedTenantIds = (createDto.allowedTenantIds ?? []).map((id) =>
      this.toObjectId(id, 'allowedTenantIds'),
    );

    const isPrivate = createDto.isPrivate ?? false;
    if (isPrivate && allowedTenantIds.length === 0) {
      throw new BadRequestException(
        'allowedTenantIds is required when isPrivate is true',
      );
    }

    return {
      code,
      description: createDto.description,
      type,
      discountType,
      amount,
      validFrom,
      validTo,
      maxUses,
      maxUsesPerTenant,
      applicablePackageIds,
      isPrivate,
      allowedTenantIds,
      status: createDto.status ?? 'active',
      createdBy: userId ? this.toObjectId(userId, 'userId') : undefined,
      notes: createDto.notes,
    };
  }

  private mapUpdateDtoToPatch(updateDto: UpdateCouponDto, userId?: string) {
    const patch: Record<string, any> = {
      updatedBy: userId ? this.toObjectId(userId, 'userId') : undefined,
    };

    if (updateDto.code !== undefined) patch.code = this.normalizeCode(updateDto.code);
    if (updateDto.description !== undefined) patch.description = updateDto.description;
    if (updateDto.type !== undefined) patch.type = updateDto.type;
    if (updateDto.discountType !== undefined) patch.discountType = updateDto.discountType;

    const amount = updateDto.amount ?? updateDto.discount;
    if (amount !== undefined) patch.amount = amount;

    const validFromRaw = updateDto.validFrom;
    const validToRaw = updateDto.validTo ?? updateDto.expiryDate;
    if (validFromRaw !== undefined) {
      const v = new Date(validFromRaw);
      if (isNaN(v.getTime())) throw new BadRequestException('validFrom is invalid');
      patch.validFrom = v;
    }
    if (validToRaw !== undefined) {
      const v = new Date(validToRaw);
      if (isNaN(v.getTime())) throw new BadRequestException('validTo/expiryDate is invalid');
      patch.validTo = v;
    }

    const maxUses = updateDto.maxUses ?? updateDto.usageLimit;
    if (maxUses !== undefined) patch.maxUses = maxUses;
    if (updateDto.maxUsesPerTenant !== undefined) patch.maxUsesPerTenant = updateDto.maxUsesPerTenant;

    if (updateDto.applicablePackageIds !== undefined) {
      patch.applicablePackageIds = updateDto.applicablePackageIds.map((id) =>
        this.toObjectId(id, 'applicablePackageIds'),
      );
    }
    if (updateDto.isPrivate !== undefined) patch.isPrivate = updateDto.isPrivate;
    if (updateDto.allowedTenantIds !== undefined) {
      patch.allowedTenantIds = updateDto.allowedTenantIds.map((id) =>
        this.toObjectId(id, 'allowedTenantIds'),
      );
    }
    if (updateDto.status !== undefined) patch.status = updateDto.status;
    if (updateDto.notes !== undefined) patch.notes = updateDto.notes;

    return patch;
  }

  async createCoupon(createDto: CreateCouponDto, userId?: string): Promise<Coupon> {
    const couponDoc = this.mapCreateDtoToCoupon(createDto, userId);
    const coupon = new this.couponModel(couponDoc);

    try {
      const saved = await coupon.save();
      void this.auditLogService
        .log({
          action: 'coupon.create',
          status: 'success',
          actorId: userId,
          resourceType: 'Coupon',
          resourceId: String(saved._id),
          after: saved.toObject?.() ?? saved,
        })
        .catch((e) => this.logger.warn(`auditLog coupon.create failed: ${e}`));
      return saved;
    } catch (e: any) {
      // Duplicate code index will hit here
      if (e?.code === 11000) {
        throw new BadRequestException('Coupon code already exists');
      }
      throw e;
    }
  }

  async updateCoupon(
    couponId: string,
    updateDto: UpdateCouponDto,
    userId?: string,
  ): Promise<Coupon> {
    if (!Types.ObjectId.isValid(couponId)) {
      throw new BadRequestException('couponId must be a valid ObjectId');
    }
    const patch = this.mapUpdateDtoToPatch(updateDto, userId);

    const coupon = await this.couponModel
      .findByIdAndUpdate(
        couponId,
        patch,
        { new: true },
      )
      .exec();
    if (!coupon) throw new NotFoundException('Coupon not found');

    void this.auditLogService
      .log({
        action: 'coupon.update',
        status: 'success',
        actorId: userId,
        resourceType: 'Coupon',
        resourceId: String(coupon._id),
        after: coupon.toObject?.() ?? coupon,
      })
      .catch((e) => this.logger.warn(`auditLog coupon.update failed: ${e}`));

    return coupon;
  }

  async deleteCoupon(couponId: string, userId?: string): Promise<void> {
    if (!Types.ObjectId.isValid(couponId)) {
      throw new BadRequestException('couponId must be a valid ObjectId');
    }
    const coupon = await this.couponModel.findByIdAndDelete(couponId).exec();
    if (!coupon) throw new NotFoundException('Coupon not found');

    void this.auditLogService
      .log({
        action: 'coupon.delete',
        status: 'success',
        actorId: userId,
        resourceType: 'Coupon',
        resourceId: String(coupon._id),
        before: coupon.toObject?.() ?? coupon,
      })
      .catch((e) => this.logger.warn(`auditLog coupon.delete failed: ${e}`));

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
    const normalizedCode = this.normalizeCode(code);
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');

    if (!packageId) {
      return { valid: false, message: 'packageId is required' };
    }
    const packageObjectId = this.toObjectId(packageId, 'packageId');

    const coupon = await this.couponModel.findOne({ code: normalizedCode }).exec();
    if (!coupon) {
      return { valid: false, message: 'Coupon not found' };
    }

    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return { valid: false, message: 'Coupon not yet valid' };
    }
    if (coupon.validTo && now > coupon.validTo) {
      if (coupon.status !== 'expired') {
        coupon.status = 'expired';
        await coupon.save();
      }
      return { valid: false, message: 'Coupon expired' };
    }
    if (coupon.status !== 'active') {
      return { valid: false, message: 'Coupon not active' };
    }

    if (coupon.isPrivate) {
      const allowed = (coupon.allowedTenantIds ?? []).some((id) =>
        id.equals(tenantObjectId),
      );
      if (!allowed) {
        return { valid: false, message: 'Coupon not allowed for this tenant' };
      }
    }

    if ((coupon.applicablePackageIds ?? []).length > 0) {
      const ok = coupon.applicablePackageIds.some((id) => id.equals(packageObjectId));
      if (!ok) {
        return { valid: false, message: 'Coupon not applicable to this package' };
      }
    }

    const totalUses = await this.couponUsageModel.countDocuments({
      couponId: coupon._id,
    });
    const tenantUses = await this.couponUsageModel.countDocuments({
      couponId: coupon._id,
      tenantId: tenantObjectId,
    });

    if (coupon.type === 'single' && totalUses >= 1) {
      return { valid: false, message: 'Coupon already used' };
    }
    if (coupon.maxUses > 0 && totalUses >= coupon.maxUses) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }
    if (coupon.maxUsesPerTenant > 0 && tenantUses >= coupon.maxUsesPerTenant) {
      return { valid: false, message: 'Coupon usage limit reached for tenant' };
    }

    const pkg = await this.packageModel.findById(packageObjectId).exec();
    if (!pkg) {
      return { valid: false, message: 'Package not found' };
    }

    const discount = this.computeDiscount(
      { discountType: coupon.discountType as any, amount: coupon.amount },
      pkg.price,
    );

    return {
      valid: true,
      couponId: String(coupon._id),
      discount,
      discountType: coupon.discountType,
      message: 'Coupon valid',
    };
  }

  async applyCoupon(
    code: string,
    tenantId: string,
    context: string,
  ): Promise<any> {
    const normalizedCode = this.normalizeCode(code);
    const tenantObjectId = this.toObjectId(tenantId, 'tenantId');

    const coupon = await this.couponModel
      .findOne({ code: normalizedCode })
      .exec();
    if (!coupon) throw new NotFoundException('Coupon not found');

    // Resolve package via current tenant package
    const tenantPackage = await this.tenantPackageModel
      .findOne({ tenantId: tenantObjectId })
      .exec();
    if (!tenantPackage) {
      throw new BadRequestException('Tenant package not found');
    }

    const packageId = tenantPackage.packageId;

    const validity = await this.validateCoupon(
      normalizedCode,
      tenantId,
      String(packageId),
    );
    if (!validity?.valid) {
      throw new BadRequestException(validity?.message || 'Coupon invalid');
    }

    const pkg = await this.packageModel.findById(packageId).exec();
    if (!pkg) throw new BadRequestException('Package not found');

    const discount = this.computeDiscount(
      { discountType: coupon.discountType as any, amount: coupon.amount },
      pkg.price,
    );

    await this.couponUsageModel.create({
      couponId: coupon._id,
      tenantId: tenantObjectId,
      usedAt: new Date(),
      amountDiscounted: discount,
      context,
    });

    return {
      discount,
      couponId: String(coupon._id),
      discountType: coupon.discountType,
    };
  }

  async getCouponStats(couponId: string): Promise<any> {
    if (!Types.ObjectId.isValid(couponId)) {
      throw new BadRequestException('couponId must be a valid ObjectId');
    }
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
    const ids = couponIds.map((id) => this.toObjectId(id, 'couponIds'));
    await this.couponModel
      .updateMany(
        { _id: { $in: ids } },
        { status, updatedBy: userId ? this.toObjectId(userId, 'userId') : undefined },
      )
      .exec();
    return;
  }
}
