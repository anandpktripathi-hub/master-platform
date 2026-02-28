import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Coupon, CouponSchema } from '../../database/schemas/coupon.schema';
import {
  CouponUsage,
  CouponUsageSchema,
} from '../../database/schemas/coupon-usage.schema';
import { Package, PackageSchema } from '../../database/schemas/package.schema';
import {
  TenantPackage,
  TenantPackageSchema,
} from '../../database/schemas/tenant-package.schema';
import {
  AuditLog,
  AuditLogSchema,
} from '../../database/schemas/audit-log.schema';
import { CouponController } from './coupons.controller';
import { CouponService } from './services/coupon.service';
import { AuditLogService } from '../../services/audit-log.service';
import { RoleGuard } from '../../guards/role.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Coupon.name, schema: CouponSchema },
      { name: CouponUsage.name, schema: CouponUsageSchema },
      { name: Package.name, schema: PackageSchema },
      { name: TenantPackage.name, schema: TenantPackageSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [CouponController],
  providers: [CouponService, AuditLogService, RoleGuard],
  exports: [CouponService],
})
export class CouponsModule {}
