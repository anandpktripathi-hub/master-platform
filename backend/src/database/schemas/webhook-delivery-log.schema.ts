import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WebhookDeliveryLogDocument = WebhookDeliveryLog & Document;

@Schema({ timestamps: true })
export class WebhookDeliveryLog {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  event!: string; // e.g. 'invoice.paid', 'domain.verified'

  @Prop({ required: true })
  url!: string;

  @Prop({ required: true })
  method!: string; // POST

  @Prop({ type: Object, required: false })
  requestHeaders?: Record<string, string>;

  @Prop({ type: Object, required: false })
  requestBody?: Record<string, unknown>;

  @Prop({ required: false })
  responseStatus?: number;

  @Prop({ type: Object, required: false })
  responseHeaders?: Record<string, string>;

  @Prop({ required: false })
  responseBody?: string;

  @Prop({
    type: String,
    default: 'pending',
    enum: ['pending', 'success', 'failure'],
  })
  status!: string;

  @Prop({ required: false })
  error?: string;

  @Prop({ default: 0 })
  attemptNumber!: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export const WebhookDeliveryLogSchema =
  SchemaFactory.createForClass(WebhookDeliveryLog);

WebhookDeliveryLogSchema.index({ tenantId: 1, event: 1, createdAt: -1 });
WebhookDeliveryLogSchema.index({ status: 1, createdAt: -1 });
