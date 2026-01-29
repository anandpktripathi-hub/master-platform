import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class DomainHierarchyAssignment extends Document {
  @Prop({ required: true })
  domainId!: string;

  @Prop({ type: [Types.ObjectId], ref: 'HierarchyNode', default: [] })
  hierarchyNodes!: Types.ObjectId[];
}

export const DomainHierarchyAssignmentSchema = SchemaFactory.createForClass(DomainHierarchyAssignment);
