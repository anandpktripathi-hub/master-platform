import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DomainResellerOrderDocument = DomainResellerOrder & Document;

export type DomainResellerOrderStatus =
  | 'pending'
  | 'purchased'
  | 'failed'
  | 'cancelled';

@Schema({ timestamps: true })
export class DomainResellerOrder {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  domain!: string;

  @Prop({ required: true })
  provider!: string;

  @Prop()
  providerOrderId?: string;

  @Prop({
    type: String,
    required: true,
    enum: ['pending', 'purchased', 'failed', 'cancelled'],
    default: 'pending',
  })
  status!: DomainResellerOrderStatus;

  @Prop({ type: Object })
  rawResponse?: unknown;
}

export const DomainResellerOrderSchema =
  SchemaFactory.createForClass(DomainResellerOrder);
DomainResellerOrderSchema.index({ tenantId: 1, domain: 1 });
