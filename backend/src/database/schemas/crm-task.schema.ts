import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CrmTaskDocument = CrmTask & Document;

@Schema({ timestamps: true })
export class CrmTask {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  assigneeId!: Types.ObjectId;

  @Prop({ type: Date })
  dueDate?: Date;

  @Prop({ type: Boolean, default: false })
  completed!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'CrmDeal' })
  dealId?: Types.ObjectId;

  @Prop({ type: String })
  calendarEventId?: string;
}

export const CrmTaskSchema = SchemaFactory.createForClass(CrmTask);
