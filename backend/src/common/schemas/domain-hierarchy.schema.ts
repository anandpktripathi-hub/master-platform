import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DomainHierarchyAssignmentDocument = DomainHierarchyAssignment &
  Document;

@Schema({ timestamps: true })
export class DomainHierarchyAssignment {
  @Prop({ type: String, required: true, unique: true, index: true })
  domainId!: string;

  @Prop({ type: [Types.ObjectId], ref: 'HierarchyNode', default: [] })
  hierarchyNodes!: Types.ObjectId[];
}

export const DomainHierarchyAssignmentSchema = SchemaFactory.createForClass(
  DomainHierarchyAssignment,
);
