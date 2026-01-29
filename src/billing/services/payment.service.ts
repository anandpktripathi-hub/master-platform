import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import { URLSearchParams } from 'url';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'succeeded' | 'processing';
  provider: 'stripe' | 'razorpay' | 'paypal';
  clientSecret?: string;
  paymentUrl?: string;
  // Optional, provider-specific metadata (e.g. referralCode, tenantId, invoiceId)
  metadata?: Record<string, unknown>;
}

export interface PaymentConfirmation {
  transactionId: string;
  status: 'succeeded' | 'pending' | 'failed';
  provider: 'stripe' | 'razorpay' | 'paypal';
  amount: number;
  currency: string;
}

export interface RefundResult {
  refundId: string;
  status: 'succeeded' | 'pending' | 'failed';
  amount: number;
  provider: 'stripe' | 'razorpay' | 'paypal';
}

export interface PaypalCaptureResult {
  orderId: string;
  status: string;
  amount: number;
  currency: string;
  metadata: Record<string, unknown>;
}

@Injectable()
export class PaymentService {
  private stripeSecretKey: string;
  private razorpayKeyId: string;
  private razorpayKeySecret: string;
  private paypalClientId: string;
  private paypalClientSecret: string;
  private paypalApiBase: string;

  constructor(private configService: ConfigService) {
    this.stripeSecretKey = configService.get<string>('STRIPE_SECRET_KEY') || '';
    this.razorpayKeyId = configService.get<string>('RAZORPAY_KEY_ID') || '';
    this.razorpayKeySecret =
      configService.get<string>('RAZORPAY_KEY_SECRET') || '';

    this.paypalClientId =
      configService.get<string>('PAYPAL_CLIENT_ID') || '';
    this.paypalClientSecret =
      configService.get<string>('PAYPAL_CLIENT_SECRET') || '';

    const paypalEnv =
      configService.get<string>('PAYPAL_ENV') ||
      configService.get<string>('PAYPAL_MODE') ||
      'sandbox';
    this.paypalApiBase =
      paypalEnv === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';
  }

  /**
   * Create a payment intent for Stripe
   * In production, use the actual Stripe library: import Stripe from 'stripe';
   */
  createStripePaymentIntent(
    amount: number,
    currency: string = 'inr',
    metadata?: Record<string, unknown>,
  ): PaymentIntent {
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
        metadata,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Stripe error: ${message}`);
    }
  }

  /**
   * Create a payment order for Razorpay
   * In production, use the actual Razorpay library
   */
  createRazorpayOrder(
    amount: number,
    currency: string = 'INR',
    metadata?: Record<string, unknown>,
  ): PaymentIntent {
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
        metadata,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Razorpay error: ${message}`);
    }
  }

  /**
   * Create a PayPal Checkout order for subscription billing.
   * This uses PayPal's v2/checkout/orders API and returns an approval URL
   * that the frontend can redirect the user to.
   */
  async createPaypalOrder(
    amount: number,
    currency: string = 'USD',
    metadata?: Record<string, unknown>,
  ): Promise<PaymentIntent> {
    if (!this.paypalClientId || !this.paypalClientSecret) {
      throw new BadRequestException('PayPal is not configured');
    }

    try {
      const accessToken = await this.getPaypalAccessToken();

      const orderPayload = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency.toUpperCase(),
              value: (amount / 100).toFixed(2),
            },
            // Store minimal metadata for lookup during capture/webhook handling
            custom_id: metadata ? JSON.stringify(metadata) : undefined,
          },
        ],
        application_context: {
          brand_name: this.configService.get<string>('APP_NAME') || 'SaaS Platform',
          user_action: 'PAY_NOW',
          return_url:
            this.configService.get<string>('PAYPAL_RETURN_URL') ||
            this.configService.get<string>('PUBLIC_APP_URL') +
              '/billing/paypal/return',
          cancel_url:
            this.configService.get<string>('PAYPAL_CANCEL_URL') ||
            this.configService.get<string>('PUBLIC_APP_URL') +
              '/billing/paypal/cancel',
        },
      };

      const orderResponse = await this.postToPaypal<any>(
        '/v2/checkout/orders',
        orderPayload,
        accessToken,
      );

      const approvalLink =
        Array.isArray(orderResponse?.links) &&
        orderResponse.links.find((l: any) => l.rel === 'approve');

      if (!approvalLink?.href) {
        throw new InternalServerErrorException(
          'PayPal did not return an approval URL',
        );
      }

      return {
        id: orderResponse.id,
        amount,
        currency,
        status: 'requires_payment_method',
        provider: 'paypal',
        paymentUrl: approvalLink.href,
        metadata,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`PayPal error: ${message}`);
    }
  }

  /**
   * Confirm Stripe payment
   */
  confirmStripePayment(paymentIntentId: string): PaymentConfirmation {
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Stripe error: ${message}`);
    }
  }

  /**
   * Confirm Razorpay payment
   */
  confirmRazorpayPayment(
    paymentId: string,
    _orderId: string,
  ): PaymentConfirmation {
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Razorpay error: ${message}`);
    }
  }

  /**
   * Refund a Stripe payment
   */
  refundStripePayment(paymentIntentId: string, amount?: number): RefundResult {
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Stripe refund error: ${message}`);
    }
  }

  /**
   * Refund a Razorpay payment
   */
  refundRazorpayPayment(paymentId: string, amount?: number): RefundResult {
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Razorpay refund error: ${message}`,
      );
    }
  }

  /**
   * Capture a PayPal Checkout order after user approval and
   * return normalized capture information + original metadata.
   */
  async capturePaypalOrder(orderId: string): Promise<PaypalCaptureResult> {
    if (!this.paypalClientId || !this.paypalClientSecret) {
      throw new BadRequestException('PayPal is not configured');
    }

    const accessToken = await this.getPaypalAccessToken();

    // Capture the order. For one-time charges this is the recommended
    // flow: intent=CAPTURE then POST /v2/checkout/orders/{id}/capture.
    const path = `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`;
    const response = await this.postToPaypal<any>(path, {}, accessToken);

    const status: string = response?.status || 'UNKNOWN';

    const purchaseUnit = Array.isArray(response?.purchase_units)
      ? response.purchase_units[0]
      : undefined;

    const captures = purchaseUnit?.payments?.captures;
    const capture = Array.isArray(captures) && captures.length > 0
      ? captures[0]
      : undefined;

    const amountInfo = capture?.amount || purchaseUnit?.amount || {};
    const currencyCode: string = amountInfo.currency_code || 'USD';
    const valueStr: string = amountInfo.value || '0';

    const amountNumber = Number.parseFloat(valueStr);
    const amountCents = Number.isFinite(amountNumber)
      ? Math.round(amountNumber * 100)
      : 0;

    let metadata: Record<string, unknown> = {};
    if (purchaseUnit?.custom_id) {
      try {
        const parsed = JSON.parse(purchaseUnit.custom_id as string);
        if (parsed && typeof parsed === 'object') {
          metadata = parsed as Record<string, unknown>;
        }
      } catch {
        // ignore malformed custom_id
      }
    }

    return {
      orderId,
      status,
      amount: amountCents,
      currency: currencyCode.toUpperCase(),
      metadata,
    };
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
    paypal: boolean;
  } {
    return {
      stripe: !!this.stripeSecretKey,
      razorpay: !!this.razorpayKeyId && !!this.razorpayKeySecret,
      paypal: !!this.paypalClientId && !!this.paypalClientSecret,
    };
  }

  /**
   * Helper: Generate random ID for mock responses
   */
  private _generateRandomId(): string {
    return Math.random().toString(36).substr(2, 12);
  }

  /**
   * Obtain an OAuth2 access token from PayPal.
   */
  private async getPaypalAccessToken(): Promise<string> {
    const url = new URL(this.paypalApiBase);
    const body = new URLSearchParams({ grant_type: 'client_credentials' });

    const auth = Buffer.from(
      `${this.paypalClientId}:${this.paypalClientSecret}`,
      'utf8',
    ).toString('base64');

    const data = await this.httpsRequest(url.hostname, '/v1/oauth2/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body.toString()),
      },
    }, body.toString());

    if (!data.access_token) {
      throw new InternalServerErrorException('Unable to obtain PayPal access token');
    }

    return data.access_token as string;
  }

  /**
   * Helper: perform an HTTPS request to PayPal and parse JSON response.
   */
  private async postToPaypal<T>(
    path: string,
    payload: any,
    accessToken: string,
  ): Promise<T> {
    const url = new URL(this.paypalApiBase);
    const body = JSON.stringify(payload);

    return this.httpsRequest<T>(
      url.hostname,
      path,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      body,
    );
  }

  private async httpsRequest<T = any>(
    host: string,
    path: string,
    options: https.RequestOptions,
    body?: string,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const requestOptions: https.RequestOptions = {
        host,
        path,
        ...options,
      };

      const req = https.request(requestOptions, (res) => {
        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
        });
        res.on('end', () => {
          try {
            const statusCode = res.statusCode || 0;
            if (statusCode < 200 || statusCode >= 300) {
              return reject(
                new Error(
                  `HTTP ${statusCode} from PayPal: ${raw || res.statusMessage}`,
                ),
              );
            }
            const parsed = raw ? JSON.parse(raw) : {};
            resolve(parsed as T);
          } catch (err) {
            reject(err);
          }
        });
      });

      req.on('error', (err) => reject(err));

      if (body) {
        req.write(body);
      }
      req.end();
    });
  }
}
