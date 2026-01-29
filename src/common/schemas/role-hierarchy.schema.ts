import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class RoleHierarchyAssignment extends Document {
  @Prop({ required: true })
  roleName!: string; // e.g. 'TENANT_OWNER', 'accountant', etc.

  @Prop({ type: [Types.ObjectId], ref: 'HierarchyNode', default: [] })
  hierarchyNodes!: Types.ObjectId[]; // Assigned features/options/submodules
}

export const RoleHierarchyAssignmentSchema = SchemaFactory.createForClass(RoleHierarchyAssignment);
