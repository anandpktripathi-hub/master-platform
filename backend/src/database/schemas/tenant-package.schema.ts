import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TenantPackageDocument = TenantPackage & Document;

export interface UsageCounters {
  domains: number;
  customDomains: number;
  subdomains: number;
  paths: number;
  storageMb: number;
  teamMembers: number;
  pages: number;
  [key: string]: number;
}

@Schema({ timestamps: true })
export class TenantPackage {
  // Virtual/string identifier for Mongoose documents
  id?: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Tenant',
    required: true,
  })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Package', required: true })
  packageId!: Types.ObjectId;

  @Prop({
    enum: ['trial', 'active', 'expired', 'suspended', 'cancelled'],
    default: 'trial',
  })
  status!: string;

  @Prop({ required: true })
  startedAt!: Date;

  @Prop({ required: false })
  expiresAt!: Date; // For trial or subscription end

  @Prop({ required: false })
  trialEndsAt!: Date; // Separate trial end date

  @Prop({ required: false })
  renewalDate!: Date; // Next billing cycle

  @Prop({ type: Object, default: {} })
  usageCounters!: UsageCounters;

  @Prop({ type: Object, default: {} })
  overrides!: Record<string, any>; // Feature/limit overrides

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  assignedBy!: Types.ObjectId;

  @Prop({ required: false })
  notes!: string;

    // Track whether a subscription expiry warning email has been sent
    @Prop({ default: false })
    expiryWarningSent!: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const TenantPackageSchema = SchemaFactory.createForClass(TenantPackage);

TenantPackageSchema.index({ tenantId: 1 }, { unique: true });
TenantPackageSchema.index({ packageId: 1, status: 1 });
TenantPackageSchema.index({ expiresAt: 1, status: 1 });
TenantPackageSchema.index({ expiresAt: 1, expiryWarningSent: 1 });
