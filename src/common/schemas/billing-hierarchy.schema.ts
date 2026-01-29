import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class BillingHierarchyAssignment extends Document {
  @Prop({ required: true })
  billingId!: string;

  @Prop({ type: [Types.ObjectId], ref: 'HierarchyNode', default: [] })
  hierarchyNodes!: Types.ObjectId[];
}

export const BillingHierarchyAssignmentSchema = SchemaFactory.createForClass(BillingHierarchyAssignment);
