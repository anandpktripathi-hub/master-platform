import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CrmDealDocument = CrmDeal & Document;

@Schema({ timestamps: true })
export class CrmDeal {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: Types.ObjectId, ref: 'CrmContact' })
  contactId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CrmCompany' })
  companyId?: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  value!: number;

  @Prop({
    type: String,
    enum: ['NEW', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'],
    default: 'NEW',
    // index removed to avoid duplicate index warning; defined via schema.index()
  })
  stage!: 'NEW' | 'QUALIFIED' | 'PROPOSAL' | 'WON' | 'LOST';

  @Prop({ type: Types.ObjectId, ref: 'User' })
  ownerId?: Types.ObjectId;

  @Prop({ type: String })
  source?: string; // directory, website, manual
}

export const CrmDealSchema = SchemaFactory.createForClass(CrmDeal);

CrmDealSchema.index({ tenantId: 1, createdAt: -1 });
CrmDealSchema.index({ tenantId: 1, stage: 1, createdAt: -1 });
CrmDealSchema.index({ tenantId: 1, ownerId: 1, createdAt: -1 });
