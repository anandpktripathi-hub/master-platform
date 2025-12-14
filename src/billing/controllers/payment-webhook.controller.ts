import { Controller, Post, Body, Req, HttpCode, BadRequestException } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InvoicesService } from '../services/invoices.service';
import { SubscriptionsService } from '../services/subscriptions.service';
import { SubscriptionStatus } from '../schemas/subscription.schema';
import { InvoiceStatus } from '../schemas/invoice.schema';
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
    @Body() event: any,
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
      switch (event.type) {
        case 'payment_intent.succeeded':
          return this._handleStripePaymentSucceeded(event.data.object);

        case 'payment_intent.payment_failed':
          return this._handleStripePaymentFailed(event.data.object);

        case 'charge.refunded':
          return this._handleStripeRefunded(event.data.object);

        case 'customer.subscription.deleted':
          return this._handleStripeSubscriptionCancelled(event.data.object);

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
  async handleRazorpayWebhook(@Body() event: any) {
    // In production, verify webhook signature:
    // const crypto = require('crypto');
    // const shasum = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET);
    // shasum.update(JSON.stringify(event));
    // const signature = shasum.digest('hex');
    // if (signature !== headers['x-razorpay-signature']) throw new BadRequestException();

    try {
      switch (event.event) {
        case 'payment.authorized':
          return this._handleRazorpayPaymentAuthorized(event.payload.payment.entity);

        case 'payment.failed':
          return this._handleRazorpayPaymentFailed(event.payload.payment.entity);

        case 'refund.created':
          return this._handleRazorpayRefundCreated(event.payload.refund.entity);

        case 'subscription.cancelled':
          return this._handleRazorpaySubscriptionCancelled(event.payload.subscription.entity);

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
  private async _handleStripePaymentSucceeded(paymentIntent: any) {
    console.log(`[Stripe] Payment succeeded: ${paymentIntent.id}`);

    // Find invoice by stripe payment intent ID and mark as paid
    // In production, query database for invoice with this stripePaymentIntentId
    // await this.invoicesService.markAsPaid(invoiceId, paymentIntent.id, 'STRIPE');

    return { received: true };
  }

  /**
   * Handle Stripe payment failed
   */
  private async _handleStripePaymentFailed(paymentIntent: any) {
    console.log(`[Stripe] Payment failed: ${paymentIntent.id}`);

    // Find invoice and mark as failed, increment failed payment count
    // In production:
    // await this.invoicesService.markAsFailed(invoiceId);
    // const subscription = await this.subscriptionsService.findByPaymentIntentId(...);
    // if (subscription.failedPaymentCount >= 3) {
    //   await this.subscriptionsService.updateStatus(subscriptionId, SubscriptionStatus.PAST_DUE);
    // }

    return { received: true };
  }

  /**
   * Handle Stripe refund
   */
  private async _handleStripeRefunded(charge: any) {
    console.log(`[Stripe] Refund processed: ${charge.id}`);

    // Find invoice by stripe charge ID and update refund status
    // In production:
    // const invoice = await this.invoicesService.findByStripeChargeId(charge.id);
    // await this.invoicesService.refund(invoiceId, charge.amount_refunded);

    return { received: true };
  }

  /**
   * Handle Stripe subscription cancelled
   */
  private async _handleStripeSubscriptionCancelled(subscription: any) {
    console.log(`[Stripe] Subscription cancelled: ${subscription.id}`);

    // Find and cancel subscription
    // In production:
    // const dbSubscription = await this.subscriptionsService.findByStripeId(subscription.id);
    // await this.subscriptionsService.updateStatus(dbSubscription._id, SubscriptionStatus.CANCELLED);

    return { received: true };
  }

  /**
   * Handle Razorpay payment authorized
   */
  private async _handleRazorpayPaymentAuthorized(payment: any) {
    console.log(`[Razorpay] Payment authorized: ${payment.id}`);

    // Find invoice by razorpay payment ID and mark as paid
    // In production:
    // const invoice = await this.invoicesService.findByRazorpayPaymentId(payment.id);
    // await this.invoicesService.markAsPaid(invoiceId, payment.id, 'RAZORPAY');

    return { received: true };
  }

  /**
   * Handle Razorpay payment failed
   */
  private async _handleRazorpayPaymentFailed(payment: any) {
    console.log(`[Razorpay] Payment failed: ${payment.id}`);

    // Find invoice and mark as failed
    // In production:
    // const invoice = await this.invoicesService.findByRazorpayPaymentId(payment.id);
    // await this.invoicesService.markAsFailed(invoiceId);

    return { received: true };
  }

  /**
   * Handle Razorpay refund
   */
  private async _handleRazorpayRefundCreated(refund: any) {
    console.log(`[Razorpay] Refund created: ${refund.id}`);

    // Find invoice and update refund status
    // In production:
    // const invoice = await this.invoicesService.findByRazorpayRefundId(refund.id);
    // await this.invoicesService.refund(invoiceId, refund.amount);

    return { received: true };
  }

  /**
   * Handle Razorpay subscription cancelled
   */
  private async _handleRazorpaySubscriptionCancelled(subscription: any) {
    console.log(`[Razorpay] Subscription cancelled: ${subscription.id}`);

    // Find and cancel subscription
    // In production:
    // const dbSubscription = await this.subscriptionsService.findByRazorpayId(subscription.id);
    // await this.subscriptionsService.updateStatus(dbSubscription._id, SubscriptionStatus.CANCELLED);

    return { received: true };
  }
}

