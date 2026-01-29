import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BusinessReviewDocument = BusinessReview & Document;

@Schema({ timestamps: true })
export class BusinessReview {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Number, min: 1, max: 5, required: true })
  rating!: number;

  @Prop({ type: String })
  comment?: string;

  @Prop({
    type: String,
    enum: ['PUBLISHED', 'PENDING', 'REJECTED'],
    default: 'PUBLISHED',
  })
  status!: 'PUBLISHED' | 'PENDING' | 'REJECTED';

  @Prop({ type: String })
  ownerReply?: string;
}

export const BusinessReviewSchema = SchemaFactory.createForClass(BusinessReview);
