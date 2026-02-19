import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Tenant, TenantSchema } from '../../database/schemas/tenant.schema';
import { User, UserSchema } from '../../database/schemas/user.schema';
import {
  TenantPackage,
  TenantPackageSchema,
} from '../../database/schemas/tenant-package.schema';
import { Billing, BillingSchema } from '../../database/schemas/billing.schema';
import { Invoice, InvoiceSchema } from '../../database/schemas/invoice.schema';
import { Domain, DomainSchema } from '../../database/schemas/domain.schema';
import {
  CustomDomain,
  CustomDomainSchema,
} from '../../database/schemas/custom-domain.schema';
import {
  PosOrder,
  PosOrderSchema,
} from '../../database/schemas/pos-order.schema';
import {
  CmsPageAnalyticsEntity,
  CmsPageAnalyticsSchema,
} from '../../cms/entities/cms.entities';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    PaymentsModule,
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
      { name: User.name, schema: UserSchema },
      { name: TenantPackage.name, schema: TenantPackageSchema },
      { name: Billing.name, schema: BillingSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Domain.name, schema: DomainSchema },
      { name: CustomDomain.name, schema: CustomDomainSchema },
      { name: PosOrder.name, schema: PosOrderSchema },
      { name: CmsPageAnalyticsEntity.name, schema: CmsPageAnalyticsSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
