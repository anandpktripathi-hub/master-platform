import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeveloperApiKeyDocument = DeveloperApiKey & Document;

@Schema({ timestamps: true })
export class DeveloperApiKey {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  createdBy!: Types.ObjectId;

  @Prop({ required: true })
  name!: string; // User-friendly label for this key

  @Prop({ required: true })
  keyHash!: string; // Bcrypt hash of the actual key

  @Prop({ required: true })
  keyPrefix!: string; // First 8 chars of key for UI display

  @Prop({ type: [String], default: [] })
  scopes!: string[]; // e.g. ['read:cms', 'write:orders']

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: Date, required: false })
  lastUsedAt!: Date;

  @Prop({ type: Date, required: false })
  expiresAt!: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const DeveloperApiKeySchema =
  SchemaFactory.createForClass(DeveloperApiKey);

DeveloperApiKeySchema.index({ tenantId: 1, isActive: 1 });
DeveloperApiKeySchema.index({ keyHash: 1 }, { unique: true });
