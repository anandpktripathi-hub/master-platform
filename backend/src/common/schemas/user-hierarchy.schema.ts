import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserHierarchyAssignmentDocument = UserHierarchyAssignment &
  Document;

@Schema({ timestamps: true })
export class UserHierarchyAssignment {
  @Prop({ type: String, required: true, unique: true, index: true })
  userId!: string;

  @Prop({ type: [Types.ObjectId], ref: 'HierarchyNode', default: [] })
  hierarchyNodes!: Types.ObjectId[];
}

export const UserHierarchyAssignmentSchema = SchemaFactory.createForClass(
  UserHierarchyAssignment,
);
