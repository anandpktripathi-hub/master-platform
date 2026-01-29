import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VCardDocument = VCard & Document;

@Schema({ timestamps: true })
export class VCard {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  @Prop({ required: true })
  displayName!: string;

  @Prop()
  jobTitle?: string;

  @Prop()
  companyName?: string;

  @Prop()
  primaryEmail?: string;

  @Prop()
  primaryPhone?: string;

  @Prop({ type: [String], default: [] })
  emails?: string[];

  @Prop({ type: [String], default: [] })
  phones?: string[];

  @Prop()
  websiteUrl?: string;

  @Prop()
  addressLine1?: string;

  @Prop()
  addressLine2?: string;

  @Prop()
  city?: string;

  @Prop()
  state?: string;

  @Prop()
  postalCode?: string;

  @Prop()
  country?: string;

  @Prop({
    type: [
      {
        label: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    default: [],
  })
  socialLinks?: Array<{ label: string; url: string }>;

  @Prop()
  qrCodeData?: string;
}

export const VCardSchema = SchemaFactory.createForClass(VCard);
VCardSchema.index({ tenantId: 1, displayName: 1 });
