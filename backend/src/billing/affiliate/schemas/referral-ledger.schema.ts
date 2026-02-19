import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReferralLedgerDocument = ReferralLedger & Document;

export type ReferralEventType = 'CLICK' | 'SIGNUP' | 'COMMISSION' | 'PAYOUT';

@Schema({ timestamps: true })
export class ReferralLedger {
  @Prop({ type: Types.ObjectId, ref: 'Affiliate', required: true })
  affiliateId!: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: ['CLICK', 'SIGNUP', 'COMMISSION', 'PAYOUT'],
  })
  type!: ReferralEventType;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: false })
  tenantId?: Types.ObjectId;

  @Prop({ default: 0 })
  amount!: number;

  @Prop({ default: 'USD' })
  currency!: string;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, unknown>;
}

export const ReferralLedgerSchema =
  SchemaFactory.createForClass(ReferralLedger);

ReferralLedgerSchema.index({ affiliateId: 1, createdAt: -1 });
