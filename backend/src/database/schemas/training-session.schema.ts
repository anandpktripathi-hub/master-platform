import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TrainingSessionDocument = TrainingSession & Document;

@Schema({ timestamps: true })
export class TrainingSession {
  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ type: Date, required: true })
  startDate!: Date;

  @Prop({ type: Date, required: true })
  endDate!: Date;

  @Prop()
  location?: string;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;
}

export const TrainingSessionSchema = SchemaFactory.createForClass(TrainingSession);
TrainingSessionSchema.index({ tenantId: 1, startDate: 1 });
