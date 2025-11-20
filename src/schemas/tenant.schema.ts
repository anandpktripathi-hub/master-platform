import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TenantDocument = Tenant & Document;

export enum TenantStatus {
  ACTIVE = 'active',
  TRIAL = 'trial',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ default: null })
  logo: string;

  @Prop({ default: null })
  domain: string;

  @Prop({ type: String, enum: TenantStatus, default: TenantStatus.TRIAL })
  status: TenantStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subscription', default: null })
  currentSubscriptionId: Types.ObjectId;

  @Prop({ type: Object, default: {} })
  settings: {
    timezone?: string;
    currency?: string;
    language?: string;
    dateFormat?: string;
    timeFormat?: string;
  };

  @Prop({ type: Object, default: {} })
  branding: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
  };

  @Prop({ type: Object, default: {} })
  features: {
    hrRecruitment?: boolean;
    pageBuilder?: boolean;
    blog?: boolean;
    ecommerce?: boolean;
    analytics?: boolean;
    emailMarketing?: boolean;
  };

  @Prop({ type: Object, default: { storage: 0, users: 0, api_calls: 0 } })
  usage: {
    storage: number;
    users: number;
    api_calls: number;
  };

  @Prop({ type: Object, default: { storage: 5000, users: 10, api_calls: 10000 } })
  limits: {
    storage: number; // in MB
    users: number;
    api_calls: number; // per month
  };

  @Prop({ default: null })
  trialEndsAt: Date;

  @Prop({ default: null })
  subscriptionEndsAt: Date;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);

TenantSchema.index({ slug: 1 }, { unique: true });
TenantSchema.index({ email: 1 }, { unique: true });
TenantSchema.index({ ownerId: 1 });
TenantSchema.index({ status: 1 });
