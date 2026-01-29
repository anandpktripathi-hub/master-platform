import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StripeService } from './stripe/stripe.service';
import { LifetimeController } from './stripe/lifetime.controller';
import { AddonsController } from './stripe/addons.controller';
import { UsageMeterService } from './usage/usage-meter.service';
import { RedisProvider } from './usage/redis.provider';
import { UsageController } from './usage/usage.controller';
import { WalletService } from './wallet/wallet.service';
import { WalletController } from './wallet/wallet.controller';
import { AffiliateService } from './affiliate/affiliate.service';
import { CommissionController } from './affiliate/commission.controller';
import { RevenueController } from './analytics/revenue.controller';
import { Affiliate, AffiliateSchema } from './affiliate/schemas/affiliate.schema';
import { ReferralLedger, ReferralLedgerSchema } from './affiliate/schemas/referral-ledger.schema';
import { Invoice, InvoiceSchema } from '../database/schemas/invoice.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Affiliate.name, schema: AffiliateSchema },
      { name: ReferralLedger.name, schema: ReferralLedgerSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
  ],
  providers: [
    StripeService,
    RedisProvider,
    UsageMeterService,
    WalletService,
    AffiliateService,
  ],
  controllers: [
    LifetimeController,
    AddonsController,
    UsageController,
    WalletController,
    CommissionController,
    RevenueController,
  ],
})
export class MonetizationModule {}
