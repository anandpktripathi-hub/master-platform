import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserHierarchyAssignment extends Document {
  @Prop({ required: true })
  userId!: string;

  @Prop({ type: [Types.ObjectId], ref: 'HierarchyNode', default: [] })
  hierarchyNodes!: Types.ObjectId[];
}

export const UserHierarchyAssignmentSchema = SchemaFactory.createForClass(UserHierarchyAssignment);
