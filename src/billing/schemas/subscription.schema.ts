import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum BillingPeriod {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export type SubscriptionDocument = Subscription & Document;

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Plan', required: true })
  planId: Types.ObjectId;

  @Prop({ enum: SubscriptionStatus, default: SubscriptionStatus.TRIAL })
  status: SubscriptionStatus;

  @Prop({ enum: BillingPeriod, default: BillingPeriod.MONTHLY })
  billingPeriod: BillingPeriod;

  @Prop({ required: true })
  startedAt: Date;

  @Prop({ required: true })
  renewAt: Date; // Next billing date

  @Prop({ required: false })
  cancelledAt?: Date;

  @Prop({ default: false })
  cancelAtPeriodEnd: boolean; // If true, subscription ends at renewAt date

  @Prop({ required: false })
  trialEndsAt?: Date; // Trial period end date

  @Prop({ default: 0 })
  amountPaid: number; // Total amount paid in cents

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ required: false })
  stripeSubscriptionId?: string; // Stripe subscription ID

  @Prop({ required: false })
  razorpaySubscriptionId?: string; // Razorpay subscription ID

  @Prop({ required: false })
  paymentMethod?: string; // 'STRIPE' | 'RAZORPAY' | 'MANUAL'

  @Prop({ default: 0 })
  failedPaymentCount: number; // Track failed payment attempts

  @Prop({ required: false })
  lastPaymentDate?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

// Indexes
SubscriptionSchema.index({ tenantId: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ renewAt: 1 });
SubscriptionSchema.index({ tenantId: 1, status: 1 }); // Composite index
