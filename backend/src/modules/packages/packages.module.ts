import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Package, PackageSchema } from '../../database/schemas/package.schema';
import {
  TenantPackage,
  TenantPackageSchema,
} from '../../database/schemas/tenant-package.schema';
import { Tenant, TenantSchema } from '../../database/schemas/tenant.schema';
import {
  AuditLog,
  AuditLogSchema,
} from '../../database/schemas/audit-log.schema';
import { RoleGuard } from '../../guards/role.guard';

import { PackageController } from './packages.controller';
import { PackageService } from './services/package.service';
import { AuditLogService } from '../../services/audit-log.service';
import { forwardRef } from '@nestjs/common';
import { PaymentsModule } from '../payments/payments.module';
import { BillingModule } from '../billing/billing.module';
import { TenantsModule } from '../tenants/tenants.module';
import { SettingsModule } from '../settings/settings.module';
import { SubscriptionExpiryScheduler } from './subscription-expiry.scheduler';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Package.name, schema: PackageSchema },
      { name: TenantPackage.name, schema: TenantPackageSchema },
      { name: Tenant.name, schema: TenantSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
    forwardRef(() => PaymentsModule),
    BillingModule,
    TenantsModule,
    SettingsModule,
  ],
  controllers: [PackageController],
  providers: [PackageService, AuditLogService, RoleGuard, SubscriptionExpiryScheduler],
  exports: [PackageService],
})
export class PackagesModule {}
