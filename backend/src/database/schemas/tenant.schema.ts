import { Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantDocument = Tenant & Document;

export type PlanKey = 'FREE' | 'PRO' | 'ENTERPRISE';

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: false, unique: true, sparse: true })
  domain!: string;

  @Prop({ required: false, unique: true })
  slug!: string;

  @Prop({ required: false })
  companyName!: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  createdByUserId!: Types.ObjectId;

  @Prop({ type: String, enum: ['FREE', 'PRO', 'ENTERPRISE'], default: 'FREE' })
  planKey!: PlanKey;

  @Prop({ default: 'trialing' })
  status!: string;

  @Prop({ default: true })
  isActive!: boolean;

  // Company Profile Fields (Step 2 of registration)
  @Prop({ required: false })
  companyDateOfBirth!: Date; // or establishedAt/incorporationDate

  @Prop({ required: false })
  companyEmail!: string;

  @Prop({ required: false })
  companyPhone!: string;

  @Prop({ required: false })
  companyAddress!: string;

  // Affiliate / referral tracking
  @Prop({ required: false })
  referralCode?: string;

  // Compliance Fields (Step 3 of registration)
  @Prop({ default: false })
  acceptedTerms!: boolean;

  @Prop({ default: false })
  acceptedPrivacy!: boolean;

  @Prop({ required: false })
  acceptedTermsAt!: Date;

  @Prop({ required: false })
  acceptedPrivacyAt!: Date;

  // Custom domains and quota fields
  @Prop({ type: [String], default: [] })
  customDomains!: string[];

  @Prop({ default: 10000 })
  maxApiCallsPerDay!: number;

  @Prop({ default: 0 })
  usedApiCallsToday!: number;

  @Prop({ default: 1024 })
  maxStorageMb!: number;

  @Prop({ default: 0 })
  usedStorageMb!: number;

  // Flags for tenant creation method
  @Prop({ default: false })
  createdByPlatformOwner?: boolean;

  @Prop({ default: false })
  skipPayment?: boolean;

  // Public business profile fields
  @Prop({ required: false })
  publicName?: string;

  @Prop({ required: false })
  tagline?: string;

  @Prop({ required: false })
  shortDescription?: string;

  @Prop({ required: false })
  fullDescription?: string;

  @Prop({ required: false })
  logoUrl?: string;

  @Prop({ required: false })
  coverImageUrl?: string;

  @Prop({ type: [String], default: [] })
  categories?: string[];

  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop({ required: false })
  websiteUrl?: string;

  @Prop({ required: false })
  contactEmailPublic?: string;

  @Prop({ required: false })
  contactPhonePublic?: string;

  @Prop({ default: false })
  isListedInDirectory!: boolean;

  @Prop({
    type: String,
    enum: ['PUBLIC', 'PRIVATE'],
    default: 'PRIVATE',
  })
  directoryVisibility!: 'PUBLIC' | 'PRIVATE';

  @Prop({ required: false })
  city?: string;

  @Prop({ required: false })
  country?: string;

  @Prop({ required: false })
  latitude?: number;

  @Prop({ required: false })
  longitude?: number;

  @Prop({
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    required: false,
  })
  priceTier?: 'LOW' | 'MEDIUM' | 'HIGH';

  @Prop({ type: Number, default: 0 })
  avgRating?: number;

  @Prop({ type: Number, default: 0 })
  reviewCount?: number;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
// Add any compound/unique indexes here if needed
