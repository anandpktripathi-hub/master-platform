import { BadRequestException } from '@nestjs/common';
import { PaymentGatewayService } from './payment-gateway.service';
import { SettingsService } from '../../settings/settings.service';
import { BillingNotificationService } from '../../billing/billing-notification.service';
import { TenantsService } from '../../tenants/tenants.service';
import Stripe from 'stripe';

jest.mock('stripe', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('PaymentGatewayService', () => {
  const baseRequest = {
    amount: 10,
    currency: 'USD',
    sourceToken: 'tok_test',
    tenantId: 'tenant-1',
    packageId: 'pkg-1',
  } as const;

  function createServiceWithSettings(settings: any): {
    service: PaymentGatewayService;
    billing: jest.Mocked<BillingNotificationService>;
    tenants: jest.Mocked<TenantsService>;
  } {
    const fakeSettingsService: any = {
      getGroupAdmin: jest.fn(),
    };

    const billingNotifications: jest.Mocked<BillingNotificationService> = {
      sendPaymentResultEmail: jest.fn().mockResolvedValue(undefined as any),
      sendInvoiceCreatedEmail: jest.fn() as any,
      sendPackageReactivatedEmail: jest.fn() as any,
      sendSubscriptionExpiringSoonEmail: jest.fn() as any,
      sendSubscriptionTerminatedEmail: jest.fn() as any,
      sendSslCertificateExpiringSoonEmail: jest.fn() as any,
    } as any;

    const tenants: jest.Mocked<TenantsService> = {
      getTenantBillingEmail: jest.fn().mockResolvedValue('billing@example.com'),
      getCurrentTenant: jest.fn() as any,
    } as any;

    const service = new PaymentGatewayService(
      fakeSettingsService as SettingsService,
      billingNotifications,
      tenants,
    );
    (service as any).settingsCache = {
      settings,
      expiresAt: Date.now() + 60_000,
    };
    return { service, billing: billingNotifications, tenants };
  }

  it('returns a failure result when payments are disabled', async () => {
    const { service } = createServiceWithSettings({
      enablePayments: false,
      gateways: {},
    });

    const result = await service.processPayment({ ...baseRequest });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/disabled/i);
  });

  it('returns a failure result when the requested gateway is not enabled', async () => {
    const { service } = createServiceWithSettings({
      enablePayments: true,
      gateways: {
        stripe: { enabled: true },
      },
    });

    const result = await service.processPayment({
      ...baseRequest,
      gatewayName: 'unknown-gateway',
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not enabled or configured/i);
  });

  it('returns a failure result when Stripe secret key is missing', async () => {
    const prevStripeKey = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;

    const { service } = createServiceWithSettings({
      enablePayments: true,
      gateways: {
        stripe: { enabled: true, secretKey: '' },
      },
    });

    const result = await service.processPayment({
      ...baseRequest,
      gatewayName: 'stripe',
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/stripe secret key is not configured/i);

    if (prevStripeKey) {
      process.env.STRIPE_SECRET_KEY = prevStripeKey;
    }
  });

  it('sends payment result notification on success', async () => {
    const { service, billing } = createServiceWithSettings({
      enablePayments: true,
      gateways: {
        stripe: { enabled: true, secretKey: 'sk_test_123' },
      },
    });

    // Mock Stripe constructor and its charges.create call
    const stripeChargesCreate = jest.fn().mockResolvedValue({
      id: 'ch_123',
      status: 'succeeded',
      failure_message: null,
    });

    const StripeCtor = Stripe as unknown as jest.Mock;
    StripeCtor.mockImplementation(() => ({
      charges: { create: stripeChargesCreate },
    }));

    const result = await service.processPayment({
      ...baseRequest,
      gatewayName: 'stripe',
    });

    expect(result.success).toBe(true);
    expect(billing.sendPaymentResultEmail).toHaveBeenCalledTimes(1);
    const payload = (billing.sendPaymentResultEmail as jest.Mock).mock
      .calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.amount).toBe(baseRequest.amount * 100);
    expect(payload.gatewayName).toBe('stripe');
  });

  it('sends payment failure notification when gateway returns error', async () => {
    const { service, billing } = createServiceWithSettings({
      enablePayments: true,
      gateways: {
        stripe: { enabled: true, secretKey: 'sk_test_123' },
      },
    });

    const stripeChargesCreate = jest.fn().mockResolvedValue({
      id: 'ch_123',
      status: 'failed',
      failure_message: 'Card declined',
    });

    const StripeCtor = Stripe as unknown as jest.Mock;
    StripeCtor.mockImplementation(() => ({
      charges: { create: stripeChargesCreate },
    }));

    const result = await service.processPayment({
      ...baseRequest,
      gatewayName: 'stripe',
    });

    expect(result.success).toBe(false);
    expect(billing.sendPaymentResultEmail).toHaveBeenCalledTimes(1);
    const payload = (billing.sendPaymentResultEmail as jest.Mock).mock
      .calls[0][0];
    expect(payload.success).toBe(false);
    expect(payload.error).toMatch(/Card declined/);
  });

  it('blocks paystack when module is explicitly disabled', async () => {
    const { service, billing } = createServiceWithSettings({
      enablePayments: true,
      gateways: {
        paystack: {
          enabled: true,
          modules: {
            domains: false,
          },
        },
      },
    });

    const result = await service.processPayment({
      ...baseRequest,
      gatewayName: 'paystack',
      module: 'domains',
    });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/disabled for module "domains"/i);
    expect(billing.sendPaymentResultEmail).not.toHaveBeenCalled();
  });

  describe('capturePaypalOrder', () => {
    it('throws BadRequestException when orderId is missing', async () => {
      const { service } = createServiceWithSettings({
        enablePayments: true,
        gateways: {
          paypal: { enabled: true },
        },
      });

      await expect(service.capturePaypalOrder('')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('returns a failure result when payments are disabled', async () => {
      const { service } = createServiceWithSettings({
        enablePayments: false,
        gateways: {
          paypal: { enabled: true },
        },
      });

      const result = await service.capturePaypalOrder('ORDER-123');
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/disabled/i);
    });

    it('returns a failure result when PayPal gateway is not enabled', async () => {
      const { service } = createServiceWithSettings({
        enablePayments: true,
        gateways: {
          paypal: { enabled: false },
        },
      });

      const result = await service.capturePaypalOrder('ORDER-123');
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/not enabled or configured/i);
    });

    it('returns a failure result when PayPal credentials are missing (no SDK require)', async () => {
      const prevClientId = process.env.PAYPAL_CLIENT_ID;
      const prevClientSecret = process.env.PAYPAL_CLIENT_SECRET;
      delete process.env.PAYPAL_CLIENT_ID;
      delete process.env.PAYPAL_CLIENT_SECRET;

      const { service } = createServiceWithSettings({
        enablePayments: true,
        gateways: {
          paypal: { enabled: true, publicKey: '', secretKey: '' },
        },
      });

      const result = await service.capturePaypalOrder('ORDER-123');
      expect(result.success).toBe(false);
      expect(result.error).toMatch(/credentials/i);

      if (prevClientId) process.env.PAYPAL_CLIENT_ID = prevClientId;
      if (prevClientSecret) process.env.PAYPAL_CLIENT_SECRET = prevClientSecret;
    });
  });
});
