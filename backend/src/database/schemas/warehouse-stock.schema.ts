import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WarehouseStockDocument = WarehouseStock & Document;

@Schema({ timestamps: true })
export class WarehouseStock {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId!: Types.ObjectId;

  @Prop({ required: true, min: 0, default: 0 })
  quantity!: number;

  @Prop({ required: true, min: 0, default: 0 })
  minStock!: number;
}

export const WarehouseStockSchema =
  SchemaFactory.createForClass(WarehouseStock);
WarehouseStockSchema.index({ tenantId: 1, productId: 1 }, { unique: true });
