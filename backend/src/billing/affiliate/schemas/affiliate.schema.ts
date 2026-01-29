import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AffiliateDocument = Affiliate & Document;

@Schema({ timestamps: true })
export class Affiliate {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  code!: string;

  @Prop({ default: 0 })
  totalClicks!: number;

  @Prop({ default: 0 })
  totalSignups!: number;

  @Prop({ default: 0 })
  totalCommissionEarned!: number;

  @Prop({ default: 0 })
  totalPaidOut!: number;

  @Prop({ default: 0 })
  balance!: number;
}

export const AffiliateSchema = SchemaFactory.createForClass(Affiliate);

AffiliateSchema.index({ code: 1 }, { unique: true });
AffiliateSchema.index({ userId: 1 }, { unique: true });
