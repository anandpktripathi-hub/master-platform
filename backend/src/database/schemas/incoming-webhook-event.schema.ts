import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type IncomingWebhookEventDocument = IncomingWebhookEvent & Document;

export type IncomingWebhookProvider = 'stripe';
export type IncomingWebhookEventStatus = 'received' | 'processed' | 'failed';

@Schema({ timestamps: true, collection: 'incoming_webhook_events' })
export class IncomingWebhookEvent {
  @Prop({ type: String, required: true, enum: ['stripe'] })
  provider!: IncomingWebhookProvider;

  @Prop({ required: true })
  eventId!: string;

  @Prop()
  accountId?: string;

  @Prop({ required: true })
  eventType!: string;

  @Prop({ required: true })
  payloadHash!: string;

  @Prop({ type: Date, required: true })
  receivedAt!: Date;

  @Prop({ type: Date, required: true, index: true })
  expiresAt!: Date;

  @Prop({
    type: String,
    required: true,
    enum: ['received', 'processed', 'failed'],
    default: 'received',
  })
  status!: IncomingWebhookEventStatus;

  @Prop({ type: Date })
  processedAt?: Date;

  @Prop({ type: Date })
  lastAttemptAt?: Date;

  @Prop({ type: Number, default: 0 })
  attempts!: number;

  @Prop({ type: Date })
  processingLockUntil?: Date;

  @Prop({ type: Object })
  processingResult?: Record<string, unknown>;

  @Prop({ type: Object })
  lastError?: {
    message?: string;
    name?: string;
    stack?: string;
  };
}

export const IncomingWebhookEventSchema =
  SchemaFactory.createForClass(IncomingWebhookEvent);

IncomingWebhookEventSchema.index(
  { provider: 1, eventId: 1 },
  { unique: true, name: 'uniq_provider_eventId' },
);

// TTL cleanup of stored events (idempotency log) after 30 days
IncomingWebhookEventSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, name: 'ttl_expiresAt' },
);
