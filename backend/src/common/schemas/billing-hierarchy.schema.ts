import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BillingHierarchyAssignmentDocument = BillingHierarchyAssignment &
  Document;

@Schema({ timestamps: true })
export class BillingHierarchyAssignment {
  @Prop({ type: String, required: true, unique: true, index: true })
  billingId!: string;

  @Prop({ type: [Types.ObjectId], ref: 'HierarchyNode', default: [] })
  hierarchyNodes!: Types.ObjectId[];
}

export const BillingHierarchyAssignmentSchema = SchemaFactory.createForClass(
  BillingHierarchyAssignment,
);
