import { Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantDocument = Tenant & Document;

export type PlanKey = 'FREE' | 'PRO' | 'ENTERPRISE';

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false, unique: true, sparse: true })
  domain?: string;

  @Prop({ required: false, unique: true })
  slug?: string;

  @Prop({ required: false })
  companyName?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  createdByUserId?: Types.ObjectId;

  @Prop({ enum: ['FREE', 'PRO', 'ENTERPRISE'], default: 'FREE' })
  planKey?: PlanKey;

  @Prop({ default: 'trialing' })
  status?: string;

  @Prop({ default: true })
  isActive?: boolean;

  // Company Profile Fields (Step 2 of registration)
  @Prop({ required: false })
  companyDateOfBirth?: Date; // or establishedAt/incorporationDate

  @Prop({ required: false })
  companyEmail?: string;

  @Prop({ required: false })
  companyPhone?: string;

  @Prop({ required: false })
  companyAddress?: string;

  // Compliance Fields (Step 3 of registration)
  @Prop({ default: false })
  acceptedTerms?: boolean;

  @Prop({ default: false })
  acceptedPrivacy?: boolean;

  @Prop({ required: false })
  acceptedTermsAt?: Date;

  @Prop({ required: false })
  acceptedPrivacyAt?: Date;

  // Flags for tenant creation method
  @Prop({ default: false })
  createdByPlatformOwner?: boolean;

  @Prop({ default: false })
  skipPayment?: boolean;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
