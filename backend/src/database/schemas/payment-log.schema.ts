import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentLogDocument = PaymentLog & Document;

@Schema({ timestamps: true })
export class PaymentLog {
  @Prop({ required: true })
  transactionId!: string;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  packageId!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true })
  currency!: string;

  @Prop({ required: true, enum: ['success', 'failed'], index: true })
  status!: 'success' | 'failed';

  @Prop()
  gatewayName?: string;

  @Prop()
  error?: string;

  // Added by Mongoose when `timestamps: true` is enabled on the schema.
  createdAt?: Date;
  updatedAt?: Date;
}

export const PaymentLogSchema = SchemaFactory.createForClass(PaymentLog);

PaymentLogSchema.index({ tenantId: 1, createdAt: -1 });
PaymentLogSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
PaymentLogSchema.index({ transactionId: 1, createdAt: -1 });
