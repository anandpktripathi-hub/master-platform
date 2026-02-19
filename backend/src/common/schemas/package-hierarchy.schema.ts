import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PackageHierarchyAssignmentDocument = PackageHierarchyAssignment &
  Document;

@Schema({ timestamps: true })
export class PackageHierarchyAssignment {
  @Prop({ type: String, required: true, unique: true, index: true })
  packageId!: string;

  @Prop({ type: [Types.ObjectId], ref: 'HierarchyNode', default: [] })
  hierarchyNodes!: Types.ObjectId[];
}

export const PackageHierarchyAssignmentSchema = SchemaFactory.createForClass(
  PackageHierarchyAssignment,
);
