import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Plan, PlanSchema } from './schemas/plan.schema';
import { Subscription, SubscriptionSchema } from './schemas/subscription.schema';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';
import { PlansService } from './services/plans.service';
import { SubscriptionsService } from './services/subscriptions.service';
import { InvoicesService } from './services/invoices.service';
import { PaymentService } from './services/payment.service';
import { PlansController } from './controllers/plans.controller';
import { SubscriptionsController } from './controllers/subscriptions.controller';
import { InvoicesController } from './controllers/invoices.controller';
import { PaymentWebhookController } from './controllers/payment-webhook.controller';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Plan.name, schema: PlanSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
  ],
  providers: [PlansService, SubscriptionsService, InvoicesService, PaymentService],
  controllers: [PlansController, SubscriptionsController, InvoicesController, PaymentWebhookController],
  exports: [PlansService, SubscriptionsService, InvoicesService, PaymentService],
})
export class BillingModule {}
