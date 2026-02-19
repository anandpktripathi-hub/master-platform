import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JobPostingDocument = JobPosting & Document;

@Schema({ timestamps: true })
export class JobPosting {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  department!: string;

  @Prop()
  location?: string;

  @Prop()
  description?: string;

  @Prop({ type: String, enum: ['open', 'closed'], default: 'open' })
  status!: 'open' | 'closed';

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;
}

export const JobPostingSchema = SchemaFactory.createForClass(JobPosting);
JobPostingSchema.index({ tenantId: 1, status: 1 });
