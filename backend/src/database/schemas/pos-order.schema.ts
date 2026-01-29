import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PosOrderDocument = PosOrder & Document;

class PosOrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId!: Types.ObjectId;

  @Prop({ required: true })
  nameSnapshot!: string;

  @Prop({ required: true, min: 1 })
  quantity!: number;

  @Prop({ required: true, min: 0 })
  unitPrice!: number;

  @Prop({ required: true, min: 0 })
  lineTotal!: number;
}

@Schema({ timestamps: true })
export class PosOrder {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: [PosOrderItem], _id: false })
  items!: PosOrderItem[];

  @Prop({ required: true, min: 0 })
  totalAmount!: number;

  @Prop({ default: 'completed' })
  status!: 'completed' | 'cancelled';

  @Prop()
  paymentMethod?: string;

  @Prop()
  customerName?: string;
}

export const PosOrderSchema = SchemaFactory.createForClass(PosOrder);
PosOrderSchema.index({ tenantId: 1, createdAt: -1 });
