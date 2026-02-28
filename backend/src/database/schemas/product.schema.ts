import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop()
  description!: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: false })
  category!: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ default: true })
  isActive!: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ tenantId: 1, createdAt: -1 });
ProductSchema.index({ tenantId: 1, isActive: 1 });
