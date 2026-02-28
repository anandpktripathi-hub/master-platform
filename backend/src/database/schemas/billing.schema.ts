import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BillingDocument = Billing & Document;

@Schema()
export class Billing {
  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true })
  currency!: string;

  @Prop({ required: true })
  status!: string;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const BillingSchema = SchemaFactory.createForClass(Billing);

BillingSchema.index({ tenantId: 1, createdAt: -1 });
BillingSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
BillingSchema.index({ status: 1, createdAt: -1 });
