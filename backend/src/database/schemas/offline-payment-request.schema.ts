import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OfflinePaymentRequestDocument = OfflinePaymentRequest & Document;

export type OfflinePaymentRequestStatus = 'pending' | 'approved' | 'rejected';

@Schema({ timestamps: true })
export class OfflinePaymentRequest {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true })
  currency!: string;

  @Prop({ required: true })
  method!: string; // e.g. "bank_transfer", "manual", "cash"

  @Prop()
  description?: string;

  @Prop()
  proofUrl?: string;

  @Prop({
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status!: OfflinePaymentRequestStatus;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export const OfflinePaymentRequestSchema = SchemaFactory.createForClass(
  OfflinePaymentRequest,
);
OfflinePaymentRequestSchema.index({ tenantId: 1, createdAt: -1 });
