import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'CANCELLED';
export type TenantPlan = 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';

@Schema({ timestamps: true })
export class Tenant extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  slug: string;

  @Prop({ type: String, required: false })
  domain?: string | null;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  ownerUserId?: Types.ObjectId;

  @Prop({ default: 'ACTIVE' })
  status: TenantStatus;

  @Prop({ default: 'FREE' })
  plan: TenantPlan;

  @Prop({ default: 0 })
  userCount: number;

  @Prop({ required: false })
  lastLoginAt?: Date;

  @Prop({ required: false })
  maxUsers?: number;

  @Prop({ required: false })
  maxStorageMB?: number;

  @Prop({ required: false })
  notes?: string;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
