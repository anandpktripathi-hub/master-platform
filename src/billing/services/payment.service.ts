import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'succeeded' | 'processing';
  provider: 'stripe' | 'razorpay';
  clientSecret?: string;
  paymentUrl?: string;
}

export interface PaymentConfirmation {
  transactionId: string;
  status: 'succeeded' | 'pending' | 'failed';
  provider: 'stripe' | 'razorpay';
  amount: number;
  currency: string;
}

export interface RefundResult {
  refundId: string;
  status: 'succeeded' | 'pending' | 'failed';
  amount: number;
  provider: 'stripe' | 'razorpay';
}

@Injectable()
export class PaymentService {
  private stripeSecretKey: string;
  private razorpayKeyId: string;
  private razorpayKeySecret: string;

  constructor(private configService: ConfigService) {
    this.stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY') || '';
    this.razorpayKeyId = this.configService.get<string>('RAZORPAY_KEY_ID') || '';
    this.razorpayKeySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET') || '';
  }

  /**
   * Create a payment intent for Stripe
   * In production, use the actual Stripe library: import Stripe from 'stripe';
   */
  async createStripePaymentIntent(
    amount: number,
    currency: string = 'inr',
    description?: string,
  ): Promise<PaymentIntent> {
    if (!this.stripeSecretKey) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      // This is a mock implementation. In production:
      // const stripe = new Stripe(this.stripeSecretKey);
      // const intent = await stripe.paymentIntents.create({ amount, currency, description });

      // For now, return a mock response
      return {
        id: `pi_${this._generateRandomId()}`,
        amount,
        currency,
        status: 'requires_payment_method',
        provider: 'stripe',
        clientSecret: `${this._generateRandomId()}_secret_${this._generateRandomId()}`,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(`Stripe error: ${error.message}`);
    }
  }

  /**
   * Create a payment order for Razorpay
   * In production, use the actual Razorpay library
   */
  async createRazorpayOrder(
    amount: number,
    currency: string = 'INR',
    description?: string,
  ): Promise<PaymentIntent> {
    if (!this.razorpayKeyId || !this.razorpayKeySecret) {
      throw new BadRequestException('Razorpay is not configured');
    }

    try {
      // This is a mock implementation. In production:
      // const RazorpayInstance = require('razorpay');
      // const instance = new RazorpayInstance({
      //   key_id: this.razorpayKeyId,
      //   key_secret: this.razorpayKeySecret,
      // });
      // const order = await instance.orders.create({ amount, currency, receipt: description });

      // For now, return a mock response
      return {
        id: `order_${this._generateRandomId()}`,
        amount,
        currency,
        status: 'requires_payment_method',
        provider: 'razorpay',
        paymentUrl: `https://checkout.razorpay.com/?key=${this.razorpayKeyId}&order_id=order_${this._generateRandomId()}`,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(`Razorpay error: ${error.message}`);
    }
  }

  /**
   * Confirm Stripe payment
   */
  async confirmStripePayment(paymentIntentId: string): Promise<PaymentConfirmation> {
    if (!this.stripeSecretKey) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      // This is a mock implementation. In production:
      // const stripe = new Stripe(this.stripeSecretKey);
      // const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

      // For now, return a mock response
      return {
        transactionId: paymentIntentId,
        status: 'succeeded',
        provider: 'stripe',
        amount: 0, // Would be fetched from Stripe in production
        currency: 'inr',
      };
    } catch (error: any) {
      throw new InternalServerErrorException(`Stripe error: ${error.message}`);
    }
  }

  /**
   * Confirm Razorpay payment
   */
  async confirmRazorpayPayment(paymentId: string, orderId: string): Promise<PaymentConfirmation> {
    if (!this.razorpayKeyId || !this.razorpayKeySecret) {
      throw new BadRequestException('Razorpay is not configured');
    }

    try {
      // This is a mock implementation. In production:
      // Verify the payment signature using crypto.createHmac
      // const crypto = require('crypto');
      // const hmac = crypto.createHmac('sha256', this.razorpayKeySecret);
      // hmac.update(`${orderId}|${paymentId}`);
      // const generated_signature = hmac.digest('hex');

      // For now, return a mock response
      return {
        transactionId: paymentId,
        status: 'succeeded',
        provider: 'razorpay',
        amount: 0, // Would be fetched from Razorpay in production
        currency: 'INR',
      };
    } catch (error: any) {
      throw new InternalServerErrorException(`Razorpay error: ${error.message}`);
    }
  }

  /**
   * Refund a Stripe payment
   */
  async refundStripePayment(paymentIntentId: string, amount?: number): Promise<RefundResult> {
    if (!this.stripeSecretKey) {
      throw new BadRequestException('Stripe is not configured');
    }

    try {
      // This is a mock implementation. In production:
      // const stripe = new Stripe(this.stripeSecretKey);
      // const refund = await stripe.refunds.create({
      //   payment_intent: paymentIntentId,
      //   amount, // Optional: partial refund
      // });

      // For now, return a mock response
      return {
        refundId: `re_${this._generateRandomId()}`,
        status: 'succeeded',
        provider: 'stripe',
        amount: amount || 0,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(`Stripe refund error: ${error.message}`);
    }
  }

  /**
   * Refund a Razorpay payment
   */
  async refundRazorpayPayment(paymentId: string, amount?: number): Promise<RefundResult> {
    if (!this.razorpayKeyId || !this.razorpayKeySecret) {
      throw new BadRequestException('Razorpay is not configured');
    }

    try {
      // This is a mock implementation. In production:
      // const RazorpayInstance = require('razorpay');
      // const instance = new RazorpayInstance({
      //   key_id: this.razorpayKeyId,
      //   key_secret: this.razorpayKeySecret,
      // });
      // const refund = await instance.payments.refund(paymentId, {
      //   amount, // Optional: partial refund (in paise)
      // });

      // For now, return a mock response
      return {
        refundId: `rfnd_${this._generateRandomId()}`,
        status: 'succeeded',
        provider: 'razorpay',
        amount: amount || 0,
      };
    } catch (error: any) {
      throw new InternalServerErrorException(`Razorpay refund error: ${error.message}`);
    }
  }

  /**
   * Get Stripe public key for frontend
   */
  getStripePublicKey(): string {
    const publicKey = this.configService.get<string>('STRIPE_PUBLIC_KEY') || '';
    if (!publicKey) {
      throw new BadRequestException('Stripe public key is not configured');
    }
    return publicKey;
  }

  /**
   * Get Razorpay key ID for frontend
   */
  getRazorpayKeyId(): string {
    if (!this.razorpayKeyId) {
      throw new BadRequestException('Razorpay is not configured');
    }
    return this.razorpayKeyId;
  }

  /**
   * Check which payment gateways are available
   */
  getAvailableGateways(): {
    stripe: boolean;
    razorpay: boolean;
  } {
    return {
      stripe: !!this.stripeSecretKey,
      razorpay: !!this.razorpayKeyId && !!this.razorpayKeySecret,
    };
  }

  /**
   * Helper: Generate random ID for mock responses
   */
  private _generateRandomId(): string {
    return Math.random().toString(36).substr(2, 12);
  }
}
