import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor() {
    const key = process.env.STRIPE_SECRET_KEY;
    console.log('DEBUG: STRIPE_SECRET_KEY =', key);
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables. Please set it in your .env file.');
    }
    this.stripe = new Stripe(key, {
      apiVersion: '2023-10-16' as any,
    });
  }

  async createCheckoutSession(params: Stripe.Checkout.SessionCreateParams) {
    return this.stripe.checkout.sessions.create(params);
  }

  async handleWebhook(event: Stripe.Event) {
    // Handle Stripe events: payment, refund, etc.
  }

  async createLifetimeProduct(tenantId: string, price: number) {
    // Create Stripe product/price for lifetime access
  }

  async createAddon(tenantId: string, addon: any) {
    // Create Stripe product/price for add-on
  }

  async createBundle(tenantId: string, bundle: any) {
    // Create Stripe product/price for bundle
  }
}
