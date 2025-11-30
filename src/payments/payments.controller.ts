import { Controller, Post, Body, Headers, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-intent')
  @ApiOperation({ summary: 'Create Stripe payment intent' })
  @ApiResponse({ status: 201, description: 'Payment intent created' })
  async createPaymentIntent(@Body() body: { amount: number; currency?: string }) {
    return this.paymentsService.createPaymentIntent(body.amount, body.currency || 'usd');
  }

  @Post('create-checkout-session')
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  @ApiResponse({ status: 201, description: 'Checkout session created' })
  async createCheckoutSession(@Body() body: { 
    items: any[]; 
    successUrl: string; 
    cancelUrl: string;
  }) {
    const session = await this.paymentsService.createCheckoutSession(
      body.items,
      body.successUrl,
      body.cancelUrl,
    );
    return { sessionId: session.id, url: session.url };
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: Request,
  ) {
    const rawBody = (request as any).rawBody || request.body;
    try {
      const event = await this.paymentsService.verifyWebhookSignature(rawBody, signature);
      
      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          console.log('Payment succeeded:', event.data.object);
          break;
        case 'payment_intent.payment_failed':
          console.log('Payment failed:', event.data.object);
          break;
        default:
          console.log('Unhandled event type:', event.type);
      }

      return { received: true };
    } catch (err) {
      return { error: err.message };
    }
  }
}
