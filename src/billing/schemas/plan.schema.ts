import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlanDocument = Plan & Document;

@Schema({ timestamps: true })
export class Plan {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  slug: string; // e.g., 'free', 'starter', 'pro', 'enterprise'

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  priceMonthly: number; // in cents (e.g., 999 = $9.99)

  @Prop({ required: true })
  priceYearly: number; // in cents

  @Prop({ type: [String], default: [] })
  features: string[]; // e.g., ['Unlimited products', 'Advanced analytics', 'API access']

  @Prop({ type: Number, required: false })
  userLimit?: number; // Max users allowed; null = unlimited

  @Prop({ type: Number, required: false })
  storageLimitMB?: number; // Max storage in MB; null = unlimited

  @Prop({ type: Number, required: false })
  ordersLimit?: number; // Max orders per month; null = unlimited

  @Prop({ type: Number, required: false })
  productsLimit?: number; // Max products; null = unlimited

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: false })
  stripePriceIdMonthly?: string; // Stripe price ID for monthly billing

  @Prop({ required: false })
  stripePriceIdYearly?: string; // Stripe price ID for yearly billing

  @Prop({ required: false })
  razorpayPlanIdMonthly?: string; // Razorpay plan ID for monthly

  @Prop({ required: false })
  razorpayPlanIdYearly?: string; // Razorpay plan ID for yearly

  @Prop({ default: 0 })
  displayOrder: number; // For sorting plans in UI

  createdAt?: Date;
  updatedAt?: Date;
}

export const PlanSchema = SchemaFactory.createForClass(Plan);

// Indexes
PlanSchema.index({ slug: 1 });
PlanSchema.index({ isActive: 1 });
