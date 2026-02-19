import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GoalDocument = Goal & Document;

export type GoalStatus = 'active' | 'achieved' | 'cancelled';

@Schema({ timestamps: true })
export class Goal {
  @Prop({ required: true })
  name!: string;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  targetAmount!: number;

  @Prop({ type: Date })
  dueDate?: Date;

  @Prop({
    type: String,
    required: true,
    enum: ['active', 'achieved', 'cancelled'],
    default: 'active',
  })
  status!: GoalStatus;

  @Prop()
  description?: string;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);
GoalSchema.index({ tenantId: 1, name: 1 }, { unique: true });
