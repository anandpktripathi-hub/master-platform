// Webhook interface for safe property access
interface WebhookData {
  type?: string;
  data?: any;
  event?: string;
  payload?: any;
  [key: string]: any;
}
import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  BadRequestException,
  Query,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InvoicesService } from '../services/invoices.service';
import { SubscriptionsService } from '../services/subscriptions.service';
import { AffiliateService } from '../affiliate/affiliate.service';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from '../services/payment.service';
import { Request } from 'express';

@ApiTags('Payment Webhooks')
@Controller('payments/webhook')
export class PaymentWebhookController {
  constructor(
    private invoicesService: InvoicesService,
    private subscriptionsService: SubscriptionsService,
    private affiliateService: AffiliateService,
    private configService: ConfigService,
    private paymentService: PaymentService,
  ) {}

  /**
   * Stripe webhook handler
   * In production, verify the webhook signature using raw body and stripe secret
   */
  @Post('stripe')
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleStripeWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Body() event: WebhookData,
  ) {
    // In production, verify webhook signature:
    // const signature = request.headers['stripe-signature'];
    // const stripe = require('stripe')(STRIPE_SECRET_KEY);
    // const event = stripe.webhooks.constructEvent(
    //   request.rawBody,
    //   signature,
    //   STRIPE_WEBHOOK_SECRET,
    // );

    try {
      switch (event?.type) {
        case 'payment_intent.succeeded':
          return this._handleStripePaymentSucceeded(
            (event.data?.object ?? {}) as { id?: string },
          );

        case 'payment_intent.payment_failed':
          return this._handleStripePaymentFailed(
            (event.data?.object ?? {}) as { id?: string },
          );

        case 'charge.refunded':
          return this._handleStripeRefunded(
            (event.data?.object ?? {}) as { id?: string },
          );

        case 'customer.subscription.deleted':
          return this._handleStripeSubscriptionCancelled(
            (event.data?.object ?? {}) as { id?: string },
          );

        default:
          console.log(`Unhandled Stripe event type: ${event.type}`);
          return { received: true };
      }
    } catch (error: any) {
      console.error('Stripe webhook error:', error);
      throw new BadRequestException('Webhook processing failed');
    }
  }

  /**
   * Razorpay webhook handler
   * In production, verify the webhook signature
   */
  @Post('razorpay')
  @HttpCode(200)
  @ApiOperation({ summary: 'Handle Razorpay webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  async handleRazorpayWebhook(@Body() event: WebhookData) {
    // In production, verify webhook signature:
    // const crypto = require('crypto');
    // const shasum = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET);
    // shasum.update(JSON.stringify(event));
    // const signature = shasum.digest('hex');
    // if (signature !== headers['x-razorpay-signature']) throw new BadRequestException();

    try {
      switch (event?.event) {
        case 'payment.authorized':
          return this._handleRazorpayPaymentAuthorized(
            (event.payload?.payment?.entity ?? {}) as { id?: string },
          );

        case 'payment.failed':
          return this._handleRazorpayPaymentFailed(
            (event.payload?.payment?.entity ?? {}) as { id?: string },
          );

        case 'refund.created':
          return this._handleRazorpayRefundCreated(
            (event.payload?.refund?.entity ?? {}) as { id?: string },
          );

        case 'subscription.cancelled':
          return this._handleRazorpaySubscriptionCancelled(
            (event.payload?.subscription?.entity ?? {}) as { id?: string },
          );

        default:
          console.log(`Unhandled Razorpay event: ${event.event}`);
          return { received: true };
      }
    } catch (error: any) {
      console.error('Razorpay webhook error:', error);
      throw new BadRequestException('Webhook processing failed');
    }
  }

  /**
   * PayPal capture endpoint (called after user returns from PayPal checkout)
   *
   * The front-end should call this with the PayPal order ID obtained
   * from the approval redirect ("token" query parameter), e.g.
   *   POST /payments/webhook/paypal/capture?orderId=XXX
   */
  @Post('paypal/capture')
  @HttpCode(200)
  @ApiOperation({ summary: 'Capture PayPal checkout order and activate subscription' })
  @ApiResponse({ status: 200, description: 'PayPal order captured and subscription updated' })
  async capturePaypalOrder(@Query('orderId') orderId?: string) {
    if (!orderId) {
      throw new BadRequestException('Missing orderId');
    }
    try {
      // Perform a real capture against PayPal and extract metadata
      // we stored in purchase_units[0].custom_id when creating the
      // order (invoiceId, subscriptionId, tenantId, referral data).
      const capture = await this.paymentService.capturePaypalOrder(orderId);

      const metadata = capture.metadata || {};
      const invoiceId = metadata.invoiceId as string | undefined;
      const subscriptionId = metadata.subscriptionId as string | undefined;
      const tenantId = metadata.tenantId as string | undefined;

      if (capture.status === 'COMPLETED' || capture.status === 'COMPLETED'.toLowerCase()) {
        if (invoiceId) {
          await this.invoicesService.markAsPaid(
            invoiceId,
            orderId,
            'PAYPAL',
          );
          console.log(`[PayPal] Invoice ${invoiceId} marked as PAID via capture`);
        }

        if (subscriptionId) {
          const subscription = await this.subscriptionsService.renewSubscription(
            subscriptionId,
          );
          console.log(
            `[PayPal] Subscription ${subscriptionId} renewed, status: ${subscription.status}`,
          );
        }
      } else {
        console.warn(
          `[PayPal] Capture for order ${orderId} returned non-completed status: ${capture.status}`,
        );
      }

      // Basic failed-payment handling similar to Stripe/Razorpay paths
      if (
        capture.status !== 'COMPLETED' &&
        tenantId &&
        invoiceId
      ) {
        await this.invoicesService.markAsFailed(invoiceId);
        console.log(`[PayPal] Invoice ${invoiceId} marked as FAILED after capture status ${capture.status}`);
      }

      return {
        success: true,
        orderId,
        status: capture.status,
      };
    } catch (error: any) {
      console.error('PayPal capture error:', error);
      throw new BadRequestException('Unable to capture PayPal order');
    }
  }

  /**
   * Handle Stripe payment succeeded
   */
  private async _handleStripePaymentSucceeded(
    paymentIntent: { id?: string } & { [key: string]: any },
  ) {
    console.log(`[Stripe] Payment succeeded: ${paymentIntent?.id}`);

    try {
      await this.recordReferralCommissionFromStripe(paymentIntent as any);
    } catch (err) {
      console.error('Error recording referral commission (Stripe):', err);
    }

    // Mark invoice as paid using metadata
    try {
      const metadata = paymentIntent.metadata || {};
      const invoiceId = metadata.invoiceId;
      const subscriptionId = metadata.subscriptionId;

      if (invoiceId) {
        await this.invoicesService.markAsPaid(
          invoiceId,
          paymentIntent.id,
          'STRIPE',
        );
        console.log(`[Stripe] Invoice ${invoiceId} marked as PAID`);
      }

      if (subscriptionId) {
        const subscription = await this.subscriptionsService.renewSubscription(subscriptionId);
        console.log(`[Stripe] Subscription ${subscriptionId} renewed, status: ${subscription.status}`);
      }
    } catch (err) {
      console.error('Error updating invoice/subscription (Stripe):', err);
    }

    return { received: true };
  }

  /**
   * Handle Stripe payment failed
   */
  private async _handleStripePaymentFailed(paymentIntent: { id?: string } & { [key: string]: any }) {
    console.log(`[Stripe] Payment failed: ${(paymentIntent as any)?.id}`);

    try {
      const metadata = paymentIntent.metadata || {};
      const invoiceId = metadata.invoiceId;
      const tenantId = metadata.tenantId;

      if (invoiceId) {
        await this.invoicesService.markAsFailed(invoiceId);
        console.log(`[Stripe] Invoice ${invoiceId} marked as FAILED`);
      }

      if (tenantId) {
        const subscription = await this.subscriptionsService.findActiveByTenantId(tenantId);
        if (subscription) {
          const failedCount = (subscription.failedPaymentCount || 0) + 1;
          (subscription as any).failedPaymentCount = failedCount;
          await (subscription as any).save();

          if (failedCount >= 3) {
            await this.subscriptionsService.updateStatus(tenantId, 'PAST_DUE' as any);
            console.log(`[Stripe] Subscription for tenant ${tenantId} marked as PAST_DUE after ${failedCount} failures`);
          }
        }
      }
    } catch (err) {
      console.error('Error handling failed payment (Stripe):', err);
    }

    return { received: true };
  }

  /**
   * Handle Stripe refund
   */
  private async _handleStripeRefunded(charge: { id?: string } & { [key: string]: any }) {
    console.log(`[Stripe] Refund processed: ${(charge as any)?.id}`);

    try {
      const metadata = charge.metadata || {};
      const invoiceId = metadata.invoiceId;
      const amountRefunded = charge.amount_refunded || 0;

      if (invoiceId && amountRefunded > 0) {
        await this.invoicesService.refund(invoiceId, amountRefunded);
        console.log(`[Stripe] Invoice ${invoiceId} refunded: ${amountRefunded}`);
      }
    } catch (err) {
      console.error('Error handling refund (Stripe):', err);
    }

    return { received: true };
  }

  /**
   * Handle Stripe subscription cancelled
   */
  private async _handleStripeSubscriptionCancelled(subscription: { id?: string } & { [key: string]: any }) {
    console.log(
      `[Stripe] Subscription cancelled: ${(subscription as any)?.id}`,
    );

    try {
      const metadata = subscription.metadata || {};
      const tenantId = metadata.tenantId;

      if (tenantId) {
        await this.subscriptionsService.updateStatus(tenantId, 'CANCELLED' as any);
        console.log(`[Stripe] Subscription for tenant ${tenantId} marked as CANCELLED`);
      }
    } catch (err) {
      console.error('Error cancelling subscription (Stripe):', err);
    }

    return { received: true };
  }

  /**
   * Handle Razorpay payment authorized
   */
  private async _handleRazorpayPaymentAuthorized(
    payment: { id?: string } & { [key: string]: any },
  ) {
    console.log(`[Razorpay] Payment authorized: ${payment?.id}`);

    try {
      await this.recordReferralCommissionFromRazorpay(payment as any);
    } catch (err) {
      console.error('Error recording referral commission (Razorpay):', err);
    }

    // Mark invoice as paid using notes/metadata
    try {
      const notes = payment.notes || {};
      const invoiceId = notes.invoiceId;
      const subscriptionId = notes.subscriptionId;

      if (invoiceId) {
        await this.invoicesService.markAsPaid(
          invoiceId,
          payment.id,
          'RAZORPAY',
        );
        console.log(`[Razorpay] Invoice ${invoiceId} marked as PAID`);
      }

      if (subscriptionId) {
        const subscription = await this.subscriptionsService.renewSubscription(subscriptionId);
        console.log(`[Razorpay] Subscription ${subscriptionId} renewed, status: ${subscription.status}`);
      }
    } catch (err) {
      console.error('Error updating invoice/subscription (Razorpay):', err);
    }

    return { received: true };
  }

  private async recordReferralCommissionFromStripe(object: any) {
    const dataObject = object || {};
    const metadata = dataObject.metadata || {};

    const rawReferralCode =
      metadata.referralCode || metadata.ref || metadata.affiliateCode;
    const affiliateId = metadata.affiliateId as string | undefined;

    if (!rawReferralCode && !affiliateId) {
      return;
    }

    const amount =
      typeof dataObject.amount_received === 'number'
        ? dataObject.amount_received
        : typeof dataObject.amount === 'number'
          ? dataObject.amount
          : 0;

    if (!amount || amount <= 0) {
      return;
    }

    const currency =
      typeof dataObject.currency === 'string'
        ? dataObject.currency.toUpperCase()
        : 'USD';

    const commissionPercent =
      this.configService.get<number>('REFERRAL_COMMISSION_PERCENT') ?? 30;

    if (affiliateId) {
      const invoice = metadata.invoiceId
        ? await this.invoicesService.findOne(metadata.invoiceId)
        : null;
      await this.affiliateService.recordCommission(
        affiliateId,
        amount / 100,
        commissionPercent,
        currency,
        {
          provider: 'STRIPE',
          paymentIntentId: dataObject.id,
          invoiceId: metadata.invoiceId,
          invoiceNumber: invoice?.invoiceNumber,
        },
      );
      return;
    }

    const referralCode = String(rawReferralCode);
    const affiliate = await (this.affiliateService as any).affiliateModel
      ?.findOne({ code: referralCode })
      .lean();

    if (!affiliate) {
      return;
    }

    const invoice = metadata.invoiceId
      ? await this.invoicesService.findOne(metadata.invoiceId)
      : null;

    await this.affiliateService.recordCommission(
      affiliate._id.toString(),
      amount / 100,
      commissionPercent,
      currency,
      {
        provider: 'STRIPE',
        paymentIntentId: dataObject.id,
        referralCode,
        invoiceId: metadata.invoiceId,
        invoiceNumber: invoice?.invoiceNumber,
      },
    );
  }

  private async recordReferralCommissionFromRazorpay(object: any) {
    const dataObject = object || {};
    const notes = dataObject.notes || {};

    const rawReferralCode =
      notes.referralCode || notes.ref || notes.affiliateCode;
    const affiliateId = notes.affiliateId as string | undefined;

    if (!rawReferralCode && !affiliateId) {
      return;
    }

    const amount =
      typeof dataObject.amount === 'number' ? dataObject.amount : 0;

    if (!amount || amount <= 0) {
      return;
    }

    const currency =
      typeof dataObject.currency === 'string'
        ? dataObject.currency.toUpperCase()
        : 'INR';

    const commissionPercent =
      this.configService.get<number>('REFERRAL_COMMISSION_PERCENT') ?? 30;

    if (affiliateId) {
      const invoice = notes.invoiceId
        ? await this.invoicesService.findOne(notes.invoiceId)
        : null;
      await this.affiliateService.recordCommission(
        affiliateId,
        amount / 100,
        commissionPercent,
        currency,
        {
          provider: 'RAZORPAY',
          paymentId: dataObject.id,
          invoiceId: notes.invoiceId,
          invoiceNumber: invoice?.invoiceNumber,
        },
      );
      return;
    }

    const referralCode = String(rawReferralCode);
    const affiliate = await (this.affiliateService as any).affiliateModel
      ?.findOne({ code: referralCode })
      .lean();

    if (!affiliate) {
      return;
    }

    const invoice = notes.invoiceId
      ? await this.invoicesService.findOne(notes.invoiceId)
      : null;

    await this.affiliateService.recordCommission(
      affiliate._id.toString(),
      amount / 100,
      commissionPercent,
      currency,
      {
        provider: 'RAZORPAY',
        paymentId: dataObject.id,
        referralCode,
        invoiceId: notes.invoiceId,
        invoiceNumber: invoice?.invoiceNumber,
      },
    );
  }

  /**
   * Handle Razorpay payment failed
   */
  private async _handleRazorpayPaymentFailed(payment: { id?: string } & { [key: string]: any }) {
    console.log(`[Razorpay] Payment failed: ${(payment as any)?.id}`);

    try {
      const notes = payment.notes || {};
      const invoiceId = notes.invoiceId;
      const tenantId = notes.tenantId;

      if (invoiceId) {
        await this.invoicesService.markAsFailed(invoiceId);
        console.log(`[Razorpay] Invoice ${invoiceId} marked as FAILED`);
      }

      if (tenantId) {
        const subscription = await this.subscriptionsService.findActiveByTenantId(tenantId);
        if (subscription) {
          const failedCount = (subscription.failedPaymentCount || 0) + 1;
          (subscription as any).failedPaymentCount = failedCount;
          await (subscription as any).save();

          if (failedCount >= 3) {
            await this.subscriptionsService.updateStatus(tenantId, 'PAST_DUE' as any);
            console.log(`[Razorpay] Subscription for tenant ${tenantId} marked as PAST_DUE after ${failedCount} failures`);
          }
        }
      }
    } catch (err) {
      console.error('Error handling failed payment (Razorpay):', err);
    }

    return { received: true };
  }

  /**
   * Handle Razorpay refund
   */
  private async _handleRazorpayRefundCreated(refund: { id?: string } & { [key: string]: any }) {
    console.log(`[Razorpay] Refund created: ${(refund as any)?.id}`);

    try {
      const notes = refund.notes || {};
      const invoiceId = notes.invoiceId;
      const amount = refund.amount || 0;

      if (invoiceId && amount > 0) {
        await this.invoicesService.refund(invoiceId, amount);
        console.log(`[Razorpay] Invoice ${invoiceId} refunded: ${amount}`);
      }
    } catch (err) {
      console.error('Error handling refund (Razorpay):', err);
    }

    return { received: true };
  }

  /**
   * Handle Razorpay subscription cancelled
   */
  private async _handleRazorpaySubscriptionCancelled(subscription: { id?: string } & { [key: string]: any }) {
    console.log(
      `[Razorpay] Subscription cancelled: ${(subscription as any)?.id}`,
    );

    try {
      const notes = subscription.notes || {};
      const tenantId = notes.tenantId;

      if (tenantId) {
        await this.subscriptionsService.updateStatus(tenantId, 'CANCELLED' as any);
        console.log(`[Razorpay] Subscription for tenant ${tenantId} marked as CANCELLED`);
      }
    } catch (err) {
      console.error('Error cancelling subscription (Razorpay):', err);
    }

    return { received: true };
  }
}
