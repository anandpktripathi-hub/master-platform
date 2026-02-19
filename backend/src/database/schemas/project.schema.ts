import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: ['planned', 'in_progress', 'completed', 'on_hold'],
    default: 'planned',
  })
  status!: 'planned' | 'in_progress' | 'completed' | 'on_hold';

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
ProjectSchema.index({ tenantId: 1, status: 1 });
