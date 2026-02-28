import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { PaymentLogService } from './services/payment-log.service';
import { PaymentsController } from './payments.controller';
import { SettingsModule } from '../settings/settings.module';
import {
  OfflinePaymentRequest,
  OfflinePaymentRequestSchema,
} from '../../database/schemas/offline-payment-request.schema';
import {
  TenantPackage,
  TenantPackageSchema,
} from '../../database/schemas/tenant-package.schema';
import { Package, PackageSchema } from '../../database/schemas/package.schema';
import { OfflinePaymentsService } from './services/offline-payments.service';
import { OfflinePaymentsController } from './controllers/offline-payments.controller';
import { AdminPaymentsController } from './controllers/admin-payments.controller';
import { BillingModule } from '../billing/billing.module';
import { TenantsModule } from '../tenants/tenants.module';
import { PackagesModule } from '../packages/packages.module';
import { PaymentLog, PaymentLogSchema } from '../../database/schemas/payment-log.schema';

@Module({
  imports: [
    SettingsModule,
    forwardRef(() => BillingModule),
    TenantsModule,
    forwardRef(() => PackagesModule),
    MongooseModule.forFeature([
      { name: OfflinePaymentRequest.name, schema: OfflinePaymentRequestSchema },
      { name: TenantPackage.name, schema: TenantPackageSchema },
      { name: Package.name, schema: PackageSchema },
      { name: PaymentLog.name, schema: PaymentLogSchema },
    ]),
  ],
  providers: [PaymentGatewayService, PaymentLogService, OfflinePaymentsService],
  controllers: [PaymentsController, OfflinePaymentsController, AdminPaymentsController],
  exports: [PaymentGatewayService, PaymentLogService, OfflinePaymentsService],
})
export class PaymentsModule {}
