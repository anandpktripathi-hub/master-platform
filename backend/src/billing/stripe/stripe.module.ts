import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout/checkout.service';
import { WebhookService } from './webhook/webhook.service';
import { SubscriptionService } from './subscription/subscription.service';
import { StripeAddonsService } from './stripe-addons.service';

@Module({
  providers: [
    CheckoutService,
    WebhookService,
    SubscriptionService,
    StripeAddonsService,
  ],
  exports: [
    CheckoutService,
    WebhookService,
    SubscriptionService,
    StripeAddonsService,
  ],
})
export class StripeModule {}
