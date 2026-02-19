import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TimesheetEntryDocument = TimesheetEntry & Document;

@Schema({ timestamps: true })
export class TimesheetEntry {
  @Prop({ type: Types.ObjectId, ref: 'Task', required: true })
  taskId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ type: Date, required: true })
  date!: Date;

  @Prop({ required: true, min: 0 })
  hours!: number;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;
}

export const TimesheetEntrySchema =
  SchemaFactory.createForClass(TimesheetEntry);
TimesheetEntrySchema.index({ tenantId: 1, projectId: 1, date: 1 });
