import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class HierarchyNode extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop({
    required: true,
    enum: [
      'module',
      'submodule',
      'feature',
      'subfeature',
      'option',
      'suboption',
      'point',
      'subpoint',
    ],
  })
  type!: string;

  @Prop({ type: Types.ObjectId, ref: 'HierarchyNode', default: null })
  parent?: Types.ObjectId | null;

  @Prop({ type: [Types.ObjectId], ref: 'HierarchyNode', default: [] })
  children!: Types.ObjectId[];

  @Prop({ default: '' })
  description?: string;

  @Prop({ default: true })
  isActive!: boolean;
}

export const HierarchyNodeSchema = SchemaFactory.createForClass(HierarchyNode);

// Indexes are mirrored in `src/migrations/add-hierarchy-indexes.ts` for production.
HierarchyNodeSchema.index({ parent: 1, type: 1 });
HierarchyNodeSchema.index({ type: 1, isActive: 1, parent: 1 });
