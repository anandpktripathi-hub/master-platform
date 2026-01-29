import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PackageHierarchyAssignment extends Document {
  @Prop({ required: true })
  packageId!: string;

  @Prop({ type: [Types.ObjectId], ref: 'HierarchyNode', default: [] })
  hierarchyNodes!: Types.ObjectId[];
}

export const PackageHierarchyAssignmentSchema = SchemaFactory.createForClass(PackageHierarchyAssignment);
