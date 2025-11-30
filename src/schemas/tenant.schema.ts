import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantDocument = Tenant & Document;

// Tenant Status Enum
export enum TenantStatus {
  ACTIVE = 'active',
  TRIAL = 'trial',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  slug: string;

  @Prop({ type: String, enum: TenantStatus, default: TenantStatus.TRIAL })
  status: TenantStatus;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 'trial' })
  subscriptionTier: string;

  @Prop()
  subscriptionExpiresAt?: Date;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
