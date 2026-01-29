import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class WebhookService {
  async handleWebhook(event: Stripe.Event) {
    // Handle Stripe events: payment, refund, etc.
    // ...implementation...
  }
}
