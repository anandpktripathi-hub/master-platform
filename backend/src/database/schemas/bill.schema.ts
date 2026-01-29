import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BillDocument = Bill & Document;

export type BillStatus = 'draft' | 'open' | 'partially_paid' | 'paid' | 'cancelled';

@Schema({ timestamps: true })
export class Bill {
  @Prop({ required: true })
  number!: string;

  @Prop({ required: true })
  vendorName!: string;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ required: true })
  currency!: string;

  @Prop({ required: true })
  totalAmount!: number;

  @Prop({ type: Date, required: true })
  issueDate!: Date;

  @Prop({ type: Date, required: true })
  dueDate!: Date;

  @Prop({
    required: true,
    enum: ['draft', 'open', 'partially_paid', 'paid', 'cancelled'],
    default: 'draft',
  })
  status!: BillStatus;

  @Prop()
  notes?: string;
}

export const BillSchema = SchemaFactory.createForClass(Bill);
BillSchema.index({ tenantId: 1, number: 1 }, { unique: true });
