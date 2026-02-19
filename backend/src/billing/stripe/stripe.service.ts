import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { SettingsService } from '../../modules/settings/settings.service';
import { entriesToPaymentDto } from '../../modules/settings/mappers/payment-settings-mappers';
import { PackageService } from '../../modules/packages/services/package.service';
import { BillingService } from '../../modules/billing/billing.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  TenantPackage,
  TenantPackageDocument,
} from '../../database/schemas/tenant-package.schema';

@Injectable()
export class StripeService {
  private stripe?: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private readonly settingsService: SettingsService,
    private readonly packageService: PackageService,
    private readonly billingService: BillingService,
    @InjectModel(TenantPackage.name)
    private readonly tenantPackageModel: Model<TenantPackageDocument>,
  ) {
    const key = process.env.STRIPE_SECRET_KEY;
    // Stripe is optional in many environments (local dev, staging, some tenants).
    // Do not throw on boot; instead, fail only when a Stripe operation is invoked.
    if (key) {
      this.stripe = new Stripe(key, {
        apiVersion: '2023-10-16' as any,
      });
    }
  }

  private requireStripe(): Stripe {
    if (!this.stripe) {
      throw new Error('Stripe is not configured (missing STRIPE_SECRET_KEY)');
    }
    return this.stripe;
  }

  async createCheckoutSession(params: Stripe.Checkout.SessionCreateParams) {
    return this.requireStripe().checkout.sessions.create(params);
  }

  /**
   * Stripe webhook signing secret.
   *
   * Resolution order:
   * - STRIPE_WEBHOOK_SECRET env var
   * - STRIPE_WEBHOOK_SIGNING_SECRET env var
   * - DB settings: group=payment, gateways.stripe.webhookSecret
   */
  async getWebhookSigningSecret(): Promise<string | undefined> {
    const envSecret =
      process.env.STRIPE_WEBHOOK_SECRET ||
      process.env.STRIPE_WEBHOOK_SIGNING_SECRET;
    if (envSecret && envSecret.trim()) {
      return envSecret.trim();
    }

    try {
      const res = await this.settingsService.getGroupAdmin('payment');
      const dto = entriesToPaymentDto(res.items);
      const stripeGateway = dto?.gateways?.stripe;
      const dbSecret = stripeGateway?.webhookSecret;
      if (typeof dbSecret === 'string' && dbSecret.trim()) {
        return dbSecret.trim();
      }
    } catch {
      // best-effort; do not fail here
    }

    return undefined;
  }

  constructWebhookEvent(
    rawBody: Buffer,
    signatureHeader: string,
    signingSecret: string,
  ): Stripe.Event {
    // Signature verification does not require a valid API key (no network call),
    // but Stripe's helper is on a Stripe instance.
    const stripe =
      this.stripe ||
      new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_invalid', {
        apiVersion: '2023-10-16' as any,
      });

    return stripe.webhooks.constructEvent(rawBody, signatureHeader, signingSecret);
  }

  async handleWebhook(event: Stripe.Event) {
    // Production-safe webhook processing:
    // - Only act on events where we can resolve tenantId/packageId from Stripe metadata.
    // - Apply stale-event protection so old webhooks cannot revert newer plan changes.
    // - Keep state transitions idempotent (route-level idempotency already enforced).

    switch (event.type) {
      case 'charge.succeeded':
        await this.onChargeSucceeded(event);
        return;
      case 'charge.refunded':
        await this.onChargeRefunded(event);
        return;
      case 'charge.dispute.created':
        await this.onChargeDisputeCreated(event);
        return;
      case 'invoice.payment_failed':
        await this.onInvoicePaymentFailed(event);
        return;
      case 'invoice.paid':
        await this.onInvoicePaid(event);
        return;
      default:
        // Ignore unrecognized events (still 2xx at handler level).
        return;
    }
  }

  private normalizeMongoId(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (!Types.ObjectId.isValid(trimmed)) return undefined;
    return trimmed;
  }

  private eventCreatedAt(event: Stripe.Event): Date {
    const created = typeof (event as any).created === 'number' ? (event as any).created : undefined;
    return new Date((created || Math.floor(Date.now() / 1000)) * 1000);
  }

  private async isStaleForTenantPackage(tenantId: string, createdAt: Date): Promise<boolean> {
    const doc = await this.tenantPackageModel
      .findOne({ tenantId: new Types.ObjectId(tenantId) })
      .select({ startedAt: 1 })
      .exec();

    if (!doc?.startedAt) return false;

    // If the tenant package was started significantly after this event,
    // treat the webhook as stale to prevent older purchases from reverting newer plan changes.
    const skewMs = doc.startedAt.getTime() - createdAt.getTime();
    return skewMs > 15 * 60 * 1000; // 15 minutes
  }

  private async onChargeSucceeded(event: Stripe.Event): Promise<void> {
    const charge = event.data.object as Stripe.Charge;
    const tenantId = this.normalizeMongoId(charge?.metadata?.tenantId);
    const packageId = this.normalizeMongoId(charge?.metadata?.packageId);

    if (!tenantId || !packageId) {
      return;
    }

    const createdAt = this.eventCreatedAt(event);
    if (await this.isStaleForTenantPackage(tenantId, createdAt)) {
      this.logger.warn(
        `Ignoring stale charge.succeeded for tenant=${tenantId} charge=${charge?.id}`,
      );
      return;
    }

    // Validate the purchase roughly matches package pricing.
    // Allow small drift (taxes/minor rounding), but block large underpayments.
    try {
      const pkg = await this.packageService.getPackage(packageId);
      const expectedMinor =
        typeof (pkg as any)?.price === 'number'
          ? Math.round(((pkg as any).price as number) * 100)
          : undefined;

      if (typeof expectedMinor === 'number' && expectedMinor > 0) {
        const paidMinor = typeof charge?.amount === 'number' ? charge.amount : 0;
        const underpaid = expectedMinor - paidMinor;
        const maxUnderpay = Math.max(50, Math.round(expectedMinor * 0.05)); // max(50 cents, 5%)
        if (underpaid > maxUnderpay) {
          this.logger.error('Stripe charge underpaid for package; ignoring upgrade', {
            tenantId,
            packageId,
            chargeId: charge?.id,
            expectedMinor,
            paidMinor,
          });
          return;
        }
      }
    } catch (err) {
      // Non-retriable for this event: if package lookup fails, ignore.
      this.logger.warn('Stripe charge references unknown package; ignoring', {
        tenantId,
        packageId,
        chargeId: charge?.id,
      });
      return;
    }

    // Reconcile plan assignment (safe even if already assigned)
    try {
      await this.packageService.assignPackageToTenant(tenantId, packageId, {
        skipPayment: true,
        startTrial: false,
        gatewayName: 'stripe',
      });
    } catch (err) {
      // If assignment fails (e.g., tenant deleted), do not retry indefinitely.
      this.logger.error('Failed to assign package from Stripe charge; ignoring', err as any);
      return;
    }

    const currency =
      typeof charge?.currency === 'string' ? charge.currency.toUpperCase() : 'USD';
    const amountMinor = typeof charge?.amount === 'number' ? charge.amount : 0;
    const amountMajor = Math.round(amountMinor) / 100;

    // Billing schema expects major units
    await this.billingService
      .createForTenant(
        {
          amount: amountMajor,
          currency,
          status: 'PAID',
        } as any,
        tenantId,
      )
      .catch((err) => {
        // Do not fail webhook if billing history write fails.
        this.logger.error('Failed to create billing record from Stripe charge', err as any);
      });
  }

  private async onChargeRefunded(event: Stripe.Event): Promise<void> {
    const charge = event.data.object as Stripe.Charge;
    const tenantId = this.normalizeMongoId(charge?.metadata?.tenantId);
    const packageId = this.normalizeMongoId(charge?.metadata?.packageId);

    if (!tenantId) {
      return;
    }

    const currency =
      typeof charge?.currency === 'string' ? charge.currency.toUpperCase() : 'USD';
    const refundedMinor =
      typeof charge?.amount_refunded === 'number' ? charge.amount_refunded : 0;
    const refundedMajor = Math.round(refundedMinor) / 100;

    await this.billingService
      .createForTenant(
        {
          amount: refundedMajor,
          currency,
          status: 'REFUNDED',
        } as any,
        tenantId,
      )
      .catch((err) => {
        this.logger.error('Failed to create refund billing record', err as any);
      });

    // Safety: if we can identify the package, suspend only when it matches the current package.
    if (packageId) {
      await this.tenantPackageModel
        .updateOne(
          {
            tenantId: new Types.ObjectId(tenantId),
            packageId: new Types.ObjectId(packageId),
            status: { $in: ['active', 'trial'] },
          },
          { $set: { status: 'suspended' } },
        )
        .exec();
    }
  }

  private async onChargeDisputeCreated(event: Stripe.Event): Promise<void> {
    const dispute = event.data.object as Stripe.Dispute;
    const chargeId = typeof dispute?.charge === 'string' ? dispute.charge : undefined;
    // Dispute events do not reliably carry metadata; best-effort fetch charge for tenant metadata.
    this.logger.warn(`Stripe dispute created charge=${chargeId || 'unknown'}`);

    if (!chargeId) return;
    if (!this.stripe) return;

    try {
      const charge = await this.requireStripe().charges.retrieve(chargeId);
      const tenantId = this.normalizeMongoId((charge as any)?.metadata?.tenantId);
      const packageId = this.normalizeMongoId((charge as any)?.metadata?.packageId);
      if (!tenantId) return;

      await this.tenantPackageModel
        .updateOne(
          {
            tenantId: new Types.ObjectId(tenantId),
            ...(packageId ? { packageId: new Types.ObjectId(packageId) } : {}),
            status: { $in: ['active', 'trial'] },
          },
          { $set: { status: 'suspended' } },
        )
        .exec();

      await this.billingService
        .createForTenant(
          {
            amount: 0,
            currency: 'USD',
            status: 'DISPUTE_CREATED',
          } as any,
          tenantId,
        )
        .catch(() => undefined);
    } catch (err) {
      this.logger.error('Failed to reconcile Stripe dispute', err as any);
    }
  }

  private async onInvoicePaymentFailed(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    const tenantId = this.normalizeMongoId((invoice as any)?.metadata?.tenantId);
    if (!tenantId) return;

    await this.tenantPackageModel
      .updateOne(
        {
          tenantId: new Types.ObjectId(tenantId),
          status: { $in: ['active', 'trial'] },
        },
        { $set: { status: 'suspended' } },
      )
      .exec();

    await this.billingService
      .createForTenant(
        {
          amount: 0,
          currency: 'USD',
          status: 'PAYMENT_FAILED',
        } as any,
        tenantId,
      )
      .catch(() => undefined);
  }

  private async onInvoicePaid(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    const tenantId = this.normalizeMongoId((invoice as any)?.metadata?.tenantId);
    if (!tenantId) return;

    await this.tenantPackageModel
      .updateOne(
        {
          tenantId: new Types.ObjectId(tenantId),
          status: 'suspended',
        },
        { $set: { status: 'active' } },
      )
      .exec();
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
