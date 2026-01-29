import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from '../email/email.module';
import { SettingsModule } from '../../backend/src/modules/settings/settings.module';
import { Plan, PlanSchema } from './schemas/plan.schema';
import {
  Subscription,
  SubscriptionSchema,
} from './schemas/subscription.schema';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';
import { Tenant, TenantSchema } from '../schemas/tenant.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Affiliate, AffiliateSchema } from './affiliate/schemas/affiliate.schema';
import { ReferralLedger, ReferralLedgerSchema } from './affiliate/schemas/referral-ledger.schema';
import { PlansService } from './services/plans.service';
import { SubscriptionsService } from './services/subscriptions.service';
import { InvoicesService } from './services/invoices.service';
import { InvoicePdfService } from './services/invoice-pdf.service';
import { PaymentService } from './services/payment.service';
import { BillingReferralMetadataService } from './services/billing-referral-metadata.service';
import { BillingNotificationService } from './services/billing-notification.service';
import { PlansController } from './controllers/plans.controller';
import { SubscriptionsController } from './controllers/subscriptions.controller';
import { InvoicesController } from './controllers/invoices.controller';
import { AdminInvoicesController } from './controllers/admin-invoices.controller';
import { PaymentWebhookController } from './controllers/payment-webhook.controller';
import { AffiliateService } from './affiliate/affiliate.service';
import { CommissionController } from './affiliate/commission.controller';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Plan.name, schema: PlanSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Tenant.name, schema: TenantSchema },
      { name: User.name, schema: UserSchema },
      { name: Affiliate.name, schema: AffiliateSchema },
      { name: ReferralLedger.name, schema: ReferralLedgerSchema },
    ]),
    DatabaseModule,
    EmailModule,
    SettingsModule,
  ],
  providers: [
    PlansService,
    SubscriptionsService,
    InvoicesService,
    InvoicePdfService,
    PaymentService,
    BillingReferralMetadataService,
    BillingNotificationService,
    AffiliateService,
  ],
  controllers: [
    PlansController,
    SubscriptionsController,
    InvoicesController,
    AdminInvoicesController,
    PaymentWebhookController,
    CommissionController,
  ],
  exports: [
    PlansService,
    SubscriptionsService,
    InvoicesService,
    PaymentService,
    BillingReferralMetadataService,
  ],
})
export class BillingModule {}
