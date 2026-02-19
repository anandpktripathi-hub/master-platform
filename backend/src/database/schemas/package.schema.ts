import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PackageDocument = Package & Document;

export interface FeatureSet {
  allowPathDomain: boolean;
  allowSubdomain: boolean;
  allowCustomDomain: boolean;
  brandingRemoval: boolean;
  advancedAnalytics: boolean;
  customTheme: boolean;
  api: boolean;
  hotelBooking: boolean;
  courseManagement: boolean;
  blogEnabled: boolean;
  ecommerceEnabled: boolean;
  bookingEnabled: boolean;
  [key: string]: boolean; // Allow dynamic features
}

export interface PackageLimits {
  maxDomains: number;
  maxCustomDomains: number;
  maxSubdomains: number;
  maxPaths: number;
  maxStorageMb: number;
  maxTeamMembers: number;
  maxPages: number;
  [key: string]: number; // Allow dynamic limits
}

@Schema({ timestamps: true })
export class Package {
  @Prop({ required: true })
  name!: string; // e.g., "Basic", "Standard", "Premium"

  @Prop({ required: false })
  description!: string;

  @Prop({ required: true })
  price!: number; // in cents or base currency unit

  @Prop({
    type: String,
    enum: ['monthly', 'annual', 'lifetime'],
    required: true,
  })
  billingCycle!: 'monthly' | 'annual' | 'lifetime';

  @Prop({ required: true, default: 0 })
  trialDays!: number; // 0 = no trial

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: Object, required: true })
  featureSet!: FeatureSet;

  @Prop({ type: Object, required: true })
  limits!: PackageLimits;

  @Prop({ required: false, type: Number })
  expiryWarningDays?: number; // Optional per-plan subscription expiry warning window

  @Prop({ required: false })
  order!: number; // Display order in UI (lower = first)

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  createdBy!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  updatedBy!: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PackageSchema = SchemaFactory.createForClass(Package);

PackageSchema.index({ isActive: 1, order: 1 });
