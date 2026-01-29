import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StockMovementDocument = StockMovement & Document;

@Schema({ timestamps: true })
export class StockMovement {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PosOrder', required: false })
  orderId?: Types.ObjectId;

  @Prop({ required: true })
  type!: 'sale' | 'purchase' | 'adjustment';

  @Prop({ required: true })
  quantityDelta!: number; // negative for sale, positive for purchase

  @Prop()
  reason?: string;
}

export const StockMovementSchema = SchemaFactory.createForClass(StockMovement);
StockMovementSchema.index({ tenantId: 1, productId: 1, createdAt: -1 });
