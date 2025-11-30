import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe | null = null;

  constructor() {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    
    if (stripeKey && stripeKey !== 'sk_test_dummy_key_for_development') {
      this.stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20' as any });
      console.log('✅ Stripe initialized successfully');
    } else {
      console.log('⚠️ Stripe not initialized (no API key provided)');
    }
  }

  async createPaymentIntent(amount: number, currency: string = 'usd') {
    if (!this.stripe) {
      throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to .env');
    }
    return this.stripe.paymentIntents.create({
      amount,
      currency,
    });
  }

  async createCheckoutSession(items: any[], successUrl: string, cancelUrl: string) {
    if (!this.stripe) {
      throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to .env');
    }
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return session;
  }

  async verifyWebhookSignature(payload: string | Buffer, signature: string) {
    if (!this.stripe) {
      throw new Error('Stripe is not configured. Please add STRIPE_SECRET_KEY to .env');
    }
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    try {
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return event;
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }
  }
}
