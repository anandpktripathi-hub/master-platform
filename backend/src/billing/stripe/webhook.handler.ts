import {
  BadRequestException,
  Controller,
  InternalServerErrorException,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { IncomingWebhookEventsService } from '../../common/webhooks/incoming-webhook-events.service';
import crypto from 'crypto';

@Controller('billing/stripe/webhook')
export class StripeWebhookHandler {
  constructor(
    private readonly stripeService: StripeService,
    private readonly incomingEvents: IncomingWebhookEventsService,
  ) {}

  @Post()
  async handle(@Req() req: Request) {
    const signature = req.headers['stripe-signature'];
    if (typeof signature !== 'string' || !signature.trim()) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const rawBody = req.body;
    if (!Buffer.isBuffer(rawBody)) {
      // If middleware isn't correctly applied, Stripe signature verification is unsafe.
      throw new BadRequestException(
        'Webhook endpoint requires raw body (application/json) to verify signature',
      );
    }

    const webhookSecret = await this.stripeService.getWebhookSigningSecret();
    if (!webhookSecret) {
      // Misconfiguration: return 5xx so Stripe retries and ops alerts fire.
      throw new InternalServerErrorException(
        'Stripe webhook signing secret is not configured',
      );
    }

    let event = undefined as any;
    try {
      event = this.stripeService.constructWebhookEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err: any) {
      throw new BadRequestException('Invalid Stripe signature');
    }

    const payloadHash = crypto.createHash('sha256').update(rawBody).digest('hex');

    const slot = await this.incomingEvents.acquireProcessingSlot({
      provider: 'stripe',
      eventId: event.id,
      eventType: event.type,
      accountId: typeof event.account === 'string' ? event.account : undefined,
      payloadHash,
    });

    if (slot.state !== 'acquired') {
      // Stripe expects 2xx for already-processed or in-progress events.
      return { received: true, duplicate: true, state: slot.state };
    }

    try {
      await this.stripeService.handleWebhook(event);
      if (slot.docId) {
        await this.incomingEvents.markProcessed(slot.docId).catch(() => undefined);
      }
      return { received: true };
    } catch (err: any) {
      if (slot.docId) {
        await this.incomingEvents.markFailed(slot.docId, err).catch(() => undefined);
      }
      // Non-2xx triggers Stripe retry. Idempotency store allows safe retries.
      throw new InternalServerErrorException('Webhook processing failed');
    }
  }
}
