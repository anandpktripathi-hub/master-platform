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
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InvoicesService } from '../services/invoices.service';
import { SubscriptionsService } from '../services/subscriptions.service';
import { Request } from 'express';

@ApiTags('Payment Webhooks')
@Controller('payments/webhook')
export class PaymentWebhookController {
  constructor(
    private invoicesService: InvoicesService,
    private subscriptionsService: SubscriptionsService,
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
   * Handle Stripe payment succeeded
   */
  private _handleStripePaymentSucceeded(paymentIntent: { id?: string }) {
    console.log(`[Stripe] Payment succeeded: ${(paymentIntent as any)?.id}`);
    // Find invoice by stripe payment intent ID and mark as paid
    // In production, query database for invoice with this stripePaymentIntentId
    // this.invoicesService.markAsPaid(invoiceId, paymentIntent.id, 'STRIPE');
    return { received: true };
  }

  /**
   * Handle Stripe payment failed
   */
  private _handleStripePaymentFailed(paymentIntent: { id?: string }) {
    console.log(`[Stripe] Payment failed: ${(paymentIntent as any)?.id}`);
    // Find invoice and mark as failed, increment failed payment count
    // In production:
    // this.invoicesService.markAsFailed(invoiceId);
    // const subscription = this.subscriptionsService.findByPaymentIntentId(...);
    // if (subscription.failedPaymentCount >= 3) {
    //   this.subscriptionsService.updateStatus(subscriptionId, SubscriptionStatus.PAST_DUE);
    // }
    return { received: true };
  }

  /**
   * Handle Stripe refund
   */
  private _handleStripeRefunded(charge: { id?: string }) {
    console.log(`[Stripe] Refund processed: ${(charge as any)?.id}`);
    // Find invoice by stripe charge ID and update refund status
    // In production:
    // const invoice = this.invoicesService.findByStripeChargeId(charge.id);
    // this.invoicesService.refund(invoiceId, charge.amount_refunded);
    return { received: true };
  }

  /**
   * Handle Stripe subscription cancelled
   */
  private _handleStripeSubscriptionCancelled(subscription: { id?: string }) {
    console.log(
      `[Stripe] Subscription cancelled: ${(subscription as any)?.id}`,
    );
    // Find and cancel subscription
    // In production:
    // const dbSubscription = this.subscriptionsService.findByStripeId(subscription.id);
    // this.subscriptionsService.updateStatus(dbSubscription._id, SubscriptionStatus.CANCELLED);
    return { received: true };
  }

  /**
   * Handle Razorpay payment authorized
   */
  private _handleRazorpayPaymentAuthorized(payment: { id?: string }) {
    console.log(`[Razorpay] Payment authorized: ${(payment as any)?.id}`);
    // Find invoice by razorpay payment ID and mark as paid
    // In production:
    // const invoice = this.invoicesService.findByRazorpayPaymentId(payment.id);
    // this.invoicesService.markAsPaid(invoiceId, payment.id, 'RAZORPAY');
    return { received: true };
  }

  /**
   * Handle Razorpay payment failed
   */
  private _handleRazorpayPaymentFailed(payment: { id?: string }) {
    console.log(`[Razorpay] Payment failed: ${(payment as any)?.id}`);
    // Find invoice and mark as failed
    // In production:
    // const invoice = this.invoicesService.findByRazorpayPaymentId(payment.id);
    // this.invoicesService.markAsFailed(invoiceId);
    return { received: true };
  }

  /**
   * Handle Razorpay refund
   */
  private _handleRazorpayRefundCreated(refund: { id?: string }) {
    console.log(`[Razorpay] Refund created: ${(refund as any)?.id}`);
    // Find invoice and update refund status
    // In production:
    // const invoice = this.invoicesService.findByRazorpayRefundId(refund.id);
    // this.invoicesService.refund(invoiceId, refund.amount);
    return { received: true };
  }

  /**
   * Handle Razorpay subscription cancelled
   */
  private _handleRazorpaySubscriptionCancelled(subscription: { id?: string }) {
    console.log(
      `[Razorpay] Subscription cancelled: ${(subscription as any)?.id}`,
    );
    // Find and cancel subscription
    // In production:
    // const dbSubscription = this.subscriptionsService.findByRazorpayId(subscription.id);
    // this.subscriptionsService.updateStatus(dbSubscription._id, SubscriptionStatus.CANCELLED);
    return { received: true };
  }
}
