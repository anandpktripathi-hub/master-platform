import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Number })
  price: number;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenant: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Number, default: 0 })
  stock: number;

  @Prop()
  imageUrl: string;

  @Prop({ type: [String] })
  tags: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
