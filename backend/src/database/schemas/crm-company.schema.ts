import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CrmCompanyDocument = CrmCompany & Document;

@Schema({ timestamps: true })
export class CrmCompany {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String })
  website?: string;

  @Prop({ type: String })
  industry?: string;
}

export const CrmCompanySchema = SchemaFactory.createForClass(CrmCompany);
