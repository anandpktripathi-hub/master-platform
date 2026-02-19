import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DomainDocument = Domain & Document;

@Schema({ timestamps: true })
export class Domain {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: String, enum: ['path', 'subdomain'], required: true })
  type!: 'path' | 'subdomain';

  @Prop({ required: true, lowercase: true, trim: true })
  value!: string; // slug for path or subdomain

  @Prop({
    type: String,
    enum: ['pending', 'active', 'suspended', 'blocked'],
    default: 'pending',
  })
  status!: string;

  @Prop({ default: false })
  isPrimary!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  createdBy!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  updatedBy!: Types.ObjectId;

  // DNS provisioning metadata (for subdomains/custom domains)
  @Prop({ required: false })
  dnsProvider?: string; // e.g. 'stub', 'cloudflare'

  @Prop({ required: false })
  dnsSyncedAt?: Date;

  @Prop({ required: false })
  dnsLastError?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const DomainSchema = SchemaFactory.createForClass(Domain);

// Compound unique index: (type, value) - each domain type+value combo is globally unique
DomainSchema.index({ type: 1, value: 1 }, { unique: true });

// Index for fast lookups by tenant + type
DomainSchema.index({ tenantId: 1, type: 1 });

// Index for primary domain per tenant
DomainSchema.index(
  { tenantId: 1, isPrimary: 1 },
  {
    unique: true,
    partialFilterExpression: { isPrimary: true, status: 'active' },
  },
);
