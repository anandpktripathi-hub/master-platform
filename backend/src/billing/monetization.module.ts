import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StripeService } from './stripe/stripe.service';
import { LifetimeController } from './stripe/lifetime.controller';
import { AddonsController } from './stripe/addons.controller';
import { StripeWebhookController } from './stripe/stripe-webhook.controller';
import { StripeWebhookRawBodyMiddleware } from './stripe/stripe-webhook-raw-body.middleware';
import { UsageMeterService } from './usage/usage-meter.service';
import { RedisProvider } from './usage/redis.provider';
import { UsageController } from './usage/usage.controller';
import { WalletService } from './wallet/wallet.service';
import { WalletController } from './wallet/wallet.controller';
import { AffiliateService } from './affiliate/affiliate.service';
import { CommissionController } from './affiliate/commission.controller';
import { RevenueController } from './analytics/revenue.controller';
import {
  Affiliate,
  AffiliateSchema,
} from './affiliate/schemas/affiliate.schema';
import {
  ReferralLedger,
  ReferralLedgerSchema,
} from './affiliate/schemas/referral-ledger.schema';
import { Invoice, InvoiceSchema } from '../database/schemas/invoice.schema';
import {
  IncomingWebhookEvent,
  IncomingWebhookEventSchema,
} from '../database/schemas/incoming-webhook-event.schema';
import { IncomingWebhookEventsService } from '../common/webhooks/incoming-webhook-events.service';
import { SettingsModule } from '../modules/settings/settings.module';
import { PackagesModule } from '../modules/packages/packages.module';
import { BillingModule } from '../modules/billing/billing.module';
import {
  TenantPackage,
  TenantPackageSchema,
} from '../database/schemas/tenant-package.schema';
import { Account, AccountSchema } from '../database/schemas/account.schema';
import {
  Transaction,
  TransactionSchema,
} from '../database/schemas/transaction.schema';

@Module({
  imports: [
    SettingsModule,
    PackagesModule,
    BillingModule,
    MongooseModule.forFeature([
      { name: Affiliate.name, schema: AffiliateSchema },
      { name: ReferralLedger.name, schema: ReferralLedgerSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: IncomingWebhookEvent.name, schema: IncomingWebhookEventSchema },
      { name: TenantPackage.name, schema: TenantPackageSchema },
      { name: Account.name, schema: AccountSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  providers: [
    StripeService,
    IncomingWebhookEventsService,
    RedisProvider,
    UsageMeterService,
    WalletService,
    AffiliateService,
  ],
  controllers: [
    LifetimeController,
    AddonsController,
    StripeWebhookController,
    UsageController,
    WalletController,
    CommissionController,
    RevenueController,
  ],
})
export class MonetizationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(StripeWebhookRawBodyMiddleware)
      .forRoutes({
        path: 'api/v1/billing/stripe/webhook',
        method: RequestMethod.POST,
      });
  }
}
