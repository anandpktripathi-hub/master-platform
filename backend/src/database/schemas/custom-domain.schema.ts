import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomDomainDocument = CustomDomain & Document;

export type CustomDomainType = 'custom' | 'subdomain';
export type CustomDomainVerificationStatus = 'pending' | 'verified' | 'failed';
// Keep a small, consistent set for v1. Older docs may contain legacy values.
export type CustomDomainSslStatus =
  | 'none'
  | 'pending'
  | 'issued'
  | 'failed'
  | 'renewing'
  | 'expired';

@Schema({ timestamps: true })
export class CustomDomain {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({
    required: true,
    lowercase: true,
    trim: true,
  })
  domain!: string;

  @Prop({
    type: String,
    enum: ['custom', 'subdomain'],
    default: 'custom',
  })
  type!: CustomDomainType;

  @Prop({
    type: String,
    enum: ['pending', 'verified', 'failed'],
    default: 'pending',
  })
  verificationStatus!: CustomDomainVerificationStatus;

  @Prop({
    type: String,
    enum: [
      'pending_verification',
      'verified',
      'ssl_pending',
      'ssl_issued',
      'active',
      'suspended',
    ],
    default: 'pending_verification',
  })
  status!: string;

  @Prop({ required: false })
  verificationToken!: string;

  @Prop({ type: String, required: false, enum: ['TXT', 'CNAME'] })
  verificationMethod!: 'TXT' | 'CNAME';

  @Prop({ required: false })
  dnsTarget!: string;

  @Prop({ required: false })
  lastVerifiedAt!: Date;

  @Prop({ type: String, required: false, enum: ['acme', 'manual'] })
  sslProvider!: 'acme' | 'manual'; // ACME (LetsEncrypt) or manually uploaded

  @Prop({
    type: String,
    required: true,
    enum: ['none', 'pending', 'issued', 'failed', 'renewing', 'expired'],
    default: 'none',
  })
  sslStatus!: CustomDomainSslStatus;

  @Prop({ required: false })
  sslCertificateId!: string; // External cert provider ID

  @Prop({ required: false })
  sslExpiresAt!: Date;

  @Prop({ required: false })
  sslIssuedAt!: Date;

  @Prop({ required: false })
  lastRenewalAttemptAt!: Date;

  @Prop({ default: false })
  isPrimary!: boolean;

  // Optional link to a specific site/website entity if/when the product
  // supports multiple sites per tenant.
  @Prop({ type: Types.ObjectId, required: false })
  targetSiteId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  createdBy!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  updatedBy!: Types.ObjectId;

  @Prop({ required: false })
  notes!: string; // Admin notes or error messages

  createdAt?: Date;
  updatedAt?: Date;
}

export const CustomDomainSchema = SchemaFactory.createForClass(CustomDomain);

// Unique index on domain name
CustomDomainSchema.index({ domain: 1 }, { unique: true });

// Index for fast lookups by tenant
CustomDomainSchema.index({ tenantId: 1, status: 1 });
CustomDomainSchema.index({ tenantId: 1, verificationStatus: 1, sslStatus: 1 });

// Index for SSL renewal checks
CustomDomainSchema.index({ sslExpiresAt: 1, status: 1 });

// Unique primary domain per active tenant
CustomDomainSchema.index(
  { tenantId: 1, isPrimary: 1 },
  {
    unique: true,
    partialFilterExpression: { isPrimary: true, status: 'active' },
  },
);
