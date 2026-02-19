import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RoleHierarchyAssignmentDocument = RoleHierarchyAssignment &
  Document;

@Schema({ timestamps: true })
export class RoleHierarchyAssignment {
  @Prop({ type: String, required: true, unique: true, index: true })
  roleName!: string;

  @Prop({ type: [Types.ObjectId], ref: 'HierarchyNode', default: [] })
  hierarchyNodes!: Types.ObjectId[];
}

export const RoleHierarchyAssignmentSchema = SchemaFactory.createForClass(
  RoleHierarchyAssignment,
);
