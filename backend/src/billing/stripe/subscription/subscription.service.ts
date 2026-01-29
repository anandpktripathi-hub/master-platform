import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class SubscriptionService {
  private stripe: Stripe;
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16' as any,
    });
  }

  async createLifetimeProduct(tenantId: string, price: number) {
    // Create Stripe product/price for lifetime access
    // ...implementation...
  }
}
