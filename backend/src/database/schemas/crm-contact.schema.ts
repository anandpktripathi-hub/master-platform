import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CrmContactDocument = CrmContact & Document;

@Schema({ timestamps: true })
export class CrmContact {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String, required: true })
  email!: string;

  @Prop({ type: String })
  phone?: string;

  @Prop({ type: String })
  companyName?: string;

  @Prop({ type: String })
  source?: string; // e.g. directory, website_form, manual

  @Prop({ type: Types.ObjectId, ref: 'User' })
  ownerId?: Types.ObjectId;
}

export const CrmContactSchema = SchemaFactory.createForClass(CrmContact);
