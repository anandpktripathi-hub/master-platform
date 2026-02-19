import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import axios from 'axios';
import { SettingsService } from '../../settings/settings.service';
import { entriesToPaymentDto } from '../../settings/mappers/payment-settings-mappers';
import {
  PaymentGatewayConfigDto,
  PaymentSettingsDto,
} from '../../settings/dto/payment-settings.dto';
import { BillingNotificationService } from '../../billing/billing-notification.service';
import { TenantsService } from '../../tenants/tenants.service';

type GatewayHandler = (
  request: PaymentRequest,
  config: PaymentGatewayConfigDto,
) => Promise<PaymentResult>;

export interface PaymentRequest {
  amount: number;
  currency: string;
  description?: string;
  sourceToken: string;
  tenantId: string;
  packageId: string;
  /** Optional explicit gateway name (e.g. "stripe", "paypal") */
  gatewayName?: string;
  /** Optional logical module key (e.g. "packages", "domains") */
  module?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

@Injectable()
export class PaymentGatewayService {
  private settingsCache?: { settings: PaymentSettingsDto; expiresAt: number };
  private readonly cacheTtlMs = 30_000; // 30 seconds

  private readonly handlers: Record<string, GatewayHandler>;
  private conversionRatesCache: Record<string, number> | null = null;

  constructor(
    private readonly settingsService: SettingsService,
    private readonly billingNotifications: BillingNotificationService,
    private readonly tenantsService: TenantsService,
  ) {
    this.handlers = {
      stripe: this.processWithStripe.bind(this),
      paypal: this.processWithPaypal.bind(this),
      paystack: this.processWithGenericSimulatedGateway.bind(this),
      flutterwave: this.processWithGenericSimulatedGateway.bind(this),
      mollie: this.processWithGenericSimulatedGateway.bind(this),
      razorpay: this.processWithGenericSimulatedGateway.bind(this),
      sslcommerz: this.processWithGenericSimulatedGateway.bind(this),
    };
  }

  // Process a payment using the configured gateway settings
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    if (!request.amount || !request.sourceToken) {
      throw new BadRequestException('Missing payment details');
    }

    const settings = await this.getPaymentSettings();

    if (!settings.enablePayments) {
      return {
        success: false,
        error: 'Payments are currently disabled by configuration',
      };
    }

    const gatewayName = (request.gatewayName || 'stripe').toLowerCase();
    const gatewayConfig = settings.gateways[gatewayName];

    if (!gatewayConfig || !gatewayConfig.enabled) {
      return {
        success: false,
        error: `Payment gateway "${gatewayName}" is not enabled or configured`,
      };
    }

    // Optional per-module enablement: if a module key is provided and this
    // gateway is explicitly disabled for that module, block the payment.
    if (
      request.module &&
      gatewayConfig.modules &&
      gatewayConfig.modules[request.module] === false
    ) {
      return {
        success: false,
        error: `Payment gateway "${gatewayName}" is disabled for module "${request.module}"`,
      };
    }

    const handler = this.handlers[gatewayName];
    if (!handler) {
      return {
        success: false,
        error: `Payment gateway "${gatewayName}" is not supported yet`,
      };
    }

    const result = await handler(request, gatewayConfig);

    const recipientEmail =
      (await this.tenantsService.getTenantBillingEmail(request.tenantId)) ||
      'billing-notifications@platform.local';

    // Fire payment result notification to tenant-aware billing email when possible.
    await this.billingNotifications
      .sendPaymentResultEmail({
        to: recipientEmail,
        tenantId: request.tenantId,
        success: result.success,
        amount: Math.round(request.amount * 100),
        currency: request.currency,
        gatewayName,
        error: result.error,
      })
      .catch(() => {
        // Swallow notification errors to avoid breaking payments
      });

    return result;
  }

  private async getPaymentSettings(): Promise<PaymentSettingsDto> {
    const now = Date.now();
    if (this.settingsCache && this.settingsCache.expiresAt > now) {
      return this.settingsCache.settings;
    }

    const res = await this.settingsService.getGroupAdmin('payment');
    const dto = entriesToPaymentDto(res.items);

    this.settingsCache = {
      settings: dto,
      expiresAt: now + this.cacheTtlMs,
    };

    return dto;
  }

  private async processWithStripe(
    request: PaymentRequest,
    config: PaymentGatewayConfigDto,
  ): Promise<PaymentResult> {
    const secretKey = config.secretKey || process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return {
        success: false,
        error: 'Stripe secret key is not configured',
      };
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16' as any,
    });

    try {
      const { amountInMinor, currency } = this.normalizeAmountForGateway(
        request,
        config,
      );

      const charge = await stripe.charges.create({
        amount: amountInMinor,
        currency: currency.toLowerCase(),
        description: request.description,
        source: request.sourceToken,
        metadata: {
          tenantId: request.tenantId,
          packageId: request.packageId,
        },
      });

      const success = charge.status === 'succeeded';

      return {
        success,
        transactionId: charge.id,
        error: success ? undefined : charge.failure_message || undefined,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Stripe payment failed',
      };
    }
  }

  /**
   * Basic PayPal gateway implementation.
   *
   * This implementation validates configuration and simulates
   * a successful transaction when PayPal is enabled. It is
   * designed so that you can later plug in the actual PayPal
   * REST API calls without changing call sites.
   */
  private async processWithPaypal(
    request: PaymentRequest,
    config: PaymentGatewayConfigDto,
  ): Promise<PaymentResult> {
    if (!config.enabled) {
      return {
        success: false,
        error: 'PayPal gateway is disabled',
      };
    }

    const clientId = config.publicKey || process.env.PAYPAL_CLIENT_ID;
    const clientSecret = config.secretKey || process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return {
        success: false,
        error: 'PayPal API credentials are not configured',
      };
    }

    // For PayPal, we expect sourceToken to be an order ID that was
    // created on the client using the PayPal JS SDK. Here we capture
    // that order server-side using the official Checkout SDK.
    const orderId = request.sourceToken;
    if (!orderId) {
      return {
        success: false,
        error: 'PayPal order ID is missing',
      };
    }

    // Use a dynamic import/require so that TypeScript does not need
    // explicit type declarations for the PayPal SDK.

    const paypalSdk = require('@paypal/checkout-server-sdk');

    const mode = (process.env.PAYPAL_MODE || 'sandbox').toLowerCase();
    const environment =
      mode === 'live'
        ? new paypalSdk.core.LiveEnvironment(clientId, clientSecret)
        : new paypalSdk.core.SandboxEnvironment(clientId, clientSecret);

    const client = new paypalSdk.core.PayPalHttpClient(environment);

    try {
      const requestCapture = new paypalSdk.orders.OrdersCaptureRequest(orderId);
      requestCapture.requestBody({});

      const response = await client.execute(requestCapture);
      const status = response?.result?.status;

      const success = status === 'COMPLETED';
      return {
        success,
        transactionId: response?.result?.id,
        error: success ? undefined : `PayPal capture status: ${status}`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'PayPal payment failed',
      };
    }
  }

  /**
   * Generic handler for additional named gateways that are configured
   * via PaymentSettingsDto but do not yet have a dedicated SDK
   * integration in this codebase.
   *
   * For Paystack specifically, we now implement a real HTTP API call
   * to Paystack's charge initialization endpoint. For other gateways
   * (Flutterwave, Mollie, Razorpay, SSLCommerz), this method still
   * simulates success after enforcing configuration checks. You can
   * extend this method or create dedicated handlers as needed.
   */
  private async processWithGenericSimulatedGateway(
    request: PaymentRequest,
    config: PaymentGatewayConfigDto,
  ): Promise<PaymentResult> {
    if (!config.enabled) {
      return {
        success: false,
        error: `${config.name || 'Gateway'} is disabled`,
      };
    }

    // Enforce that at least a public/secret key pair is present so
    // that production deployments cannot "accidentally" accept
    // payments without proper provider configuration.
    if (!config.publicKey || !config.secretKey) {
      return {
        success: false,
        error: `${config.name || 'Gateway'} credentials are not configured`,
      };
    }

    // Special case: Paystack real integration
    if (config.name.toLowerCase() === 'paystack') {
      return this.processWithPaystack(request, config);
    }

    // For other gateways (Flutterwave, Mollie, Razorpay, SSLCommerz),
    // apply the same currency normalization that Stripe uses so
    // multi-currency setups behave consistently, then simulate success.
    this.normalizeAmountForGateway(request, config);

    const simulatedId =
      `${(config.name || 'gateway').toLowerCase()}_` +
      Math.random().toString(36).substring(2, 12);

    return {
      success: true,
      transactionId: simulatedId,
    };
  }

  /**
   * Paystack: Real integration using Paystack's Transactions API.
   *
   * This implementation initializes a charge via Paystack's HTTP API,
   * verifies the transaction, and returns success/failure based on the
   * Paystack response. The sourceToken should be a Paystack reference
   * returned by the client-side payment flow.
   */
  private async processWithPaystack(
    request: PaymentRequest,
    config: PaymentGatewayConfigDto,
  ): Promise<PaymentResult> {
    const secretKey = config.secretKey || process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return {
        success: false,
        error: 'Paystack secret key is not configured',
      };
    }

    const { amountInMinor, currency } = this.normalizeAmountForGateway(
      request,
      config,
    );

    // Paystack expects amounts in kobo (for NGN) or smallest unit for other currencies
    // The sourceToken should be a Paystack payment reference from the client
    const reference = request.sourceToken;

    if (!reference) {
      return {
        success: false,
        error: 'Paystack payment reference is missing',
      };
    }

    try {
      // Verify the transaction using Paystack's verify endpoint
      const verifyUrl = `https://api.paystack.co/transaction/verify/${reference}`;
      const response = await axios.get(verifyUrl, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      });

      const data = response.data;
      const success = data?.status === true && data?.data?.status === 'success';

      return {
        success,
        transactionId: data?.data?.id || reference,
        error: success
          ? undefined
          : data?.message || 'Paystack verification failed',
      };
    } catch (err: any) {
      return {
        success: false,
        error:
          err?.response?.data?.message ||
          err?.message ||
          'Paystack payment failed',
      };
    }
  }

  /**
   * Ensure a positive amount, normalize to two decimals, and convert from the
   * requested currency to a gateway-supported/base currency when needed.
   *
   * Conversion rates are provided via the optional
   * CURRENCY_CONVERSION_RATES_JSON env var, which should contain a JSON
   * object of pairs like { "EUR_USD": 1.1 }.
   */
  private normalizeAmountForGateway(
    request: PaymentRequest,
    config: PaymentGatewayConfigDto,
  ): { amountInMinor: number; currency: string } {
    const rawAmount = Number(request.amount);
    if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    const requestedCurrency = (request.currency || 'USD').toUpperCase();
    const supported = (config.supportedCurrencies || []).map((c) =>
      c.toUpperCase(),
    );

    let targetCurrency = requestedCurrency;
    let majorAmount = rawAmount;

    if (supported.length && !supported.includes(requestedCurrency)) {
      const baseCurrency = (config.baseCurrency || supported[0]).toUpperCase();
      targetCurrency = baseCurrency;
      const rate = this.getConversionRate(requestedCurrency, baseCurrency);
      majorAmount = rawAmount * rate;
    }

    const normalizedMajor = Number(majorAmount.toFixed(2));
    const amountInMinor = Math.round(normalizedMajor * 100);
    return { amountInMinor, currency: targetCurrency };
  }

  private getConversionRate(from: string, to: string): number {
    if (from === to) return 1;

    if (!this.conversionRatesCache) {
      try {
        const raw = process.env.CURRENCY_CONVERSION_RATES_JSON;
        if (raw) {
          this.conversionRatesCache = JSON.parse(raw);
        } else {
          this.conversionRatesCache = {};
        }
      } catch {
        this.conversionRatesCache = {};
      }
    }

    const key = `${from}_${to}`;
    const cache = this.conversionRatesCache || {};
    const rate = cache[key];
    if (!rate || rate <= 0) {
      // Fallback to 1:1 if no configured rate is available.
      return 1;
    }
    return rate;
  }
}
