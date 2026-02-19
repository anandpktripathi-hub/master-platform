import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: ['todo', 'in_progress', 'done'],
    default: 'todo',
  })
  status!: 'todo' | 'in_progress' | 'done';

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  assigneeId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
TaskSchema.index({ tenantId: 1, projectId: 1, status: 1 });
