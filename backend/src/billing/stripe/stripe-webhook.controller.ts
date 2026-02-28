import {
  BadRequestException,
  Controller,
  HttpException,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { createHash } from 'crypto';
import { Request } from 'express';
import { IncomingWebhookEventsService } from '../../common/webhooks/incoming-webhook-events.service';
import { StripeService } from './stripe.service';
import { Public } from '../../common/decorators/public.decorator';
import { StripeWebhookResponseDto } from './dto/stripe-webhook-response.dto';

class AllowAllGuard {
  canActivate() {
    return true;
  }
}

@ApiTags('Billing - Stripe')
@Controller('billing/stripe/webhook')
@UseGuards(AllowAllGuard)
@Public()
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly incomingEvents: IncomingWebhookEventsService,
  ) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Stripe webhook (signature verified)' })
  @ApiResponse({ status: 200, description: 'Webhook received' })
  @ApiResponse({ status: 400, description: 'Invalid signature / payload' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Misconfigured / processing failure' })
  async handle(@Req() req: Request): Promise<StripeWebhookResponseDto> {
    try {
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
      } catch {
        throw new BadRequestException('Invalid Stripe signature');
      }

      const payloadHash = createHash('sha256').update(rawBody).digest('hex');

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
          await this.incomingEvents
            .markProcessed(slot.docId)
            .catch(() => undefined);
        }
        return { received: true };
      } catch (err: any) {
        if (slot.docId) {
          await this.incomingEvents
            .markFailed(slot.docId, err)
            .catch(() => undefined);
        }
        // Non-2xx triggers Stripe retry. Idempotency store allows safe retries.
        throw new InternalServerErrorException('Webhook processing failed');
      }
    } catch (error) {
      const err = error as any;
      this.logger.error(`[handle] ${err?.message ?? String(err)}`, err?.stack);
      throw err instanceof HttpException
        ? err
        : new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
