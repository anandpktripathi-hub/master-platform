import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomDomainDocument = CustomDomain & Document;

@Schema({ timestamps: true })
export class CustomDomain {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true, index: true })
  tenantId!: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  domain!: string;

  @Prop({
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

  @Prop({ required: false })
  verificationMethod!: 'TXT' | 'CNAME';

  @Prop({ required: false })
  dnsTarget!: string;

  @Prop({ required: false })
  lastVerifiedAt!: Date;

  @Prop({ required: false })
  sslProvider!: 'acme' | 'manual'; // ACME (LetsEncrypt) or manually uploaded

  @Prop({ required: false })
  sslStatus!: string; // pending/issued/failed/renewing

  @Prop({ required: false })
  sslCertificateId!: string; // External cert provider ID

  @Prop({ required: false })
  sslExpiresAt!: Date;

  @Prop({ required: false })
  sslIssuedAt!: Date;

  @Prop({ required: false })
  lastRenewalAttemptAt!: Date;

  @Prop({ default: false, index: true })
  isPrimary!: boolean;

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
