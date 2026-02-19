import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true })
  number!: string;

  @Prop({ required: true })
  customerName!: string;

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
    type: String,
    required: true,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft',
  })
  status!: InvoiceStatus;

  @Prop()
  notes?: string;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
InvoiceSchema.index({ tenantId: 1, number: 1 }, { unique: true });
