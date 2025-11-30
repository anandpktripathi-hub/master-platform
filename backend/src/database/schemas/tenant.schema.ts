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
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);

















