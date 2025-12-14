import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum InvoiceStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PROCESSING = 'PROCESSING',
}

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Subscription', required: true })
  subscriptionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Plan', required: true })
  planId: Types.ObjectId;

  @Prop({ required: true })
  invoiceNumber: string; // e.g., 'INV-2025-001234'

  @Prop({ required: true })
  amount: number; // in cents

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ required: false })
  description?: string; // e.g., 'Pro Plan Monthly Subscription'

  @Prop({ required: false })
  paidOn?: Date;

  @Prop({ required: false })
  dueDate?: Date;

  @Prop({ enum: InvoiceStatus, default: InvoiceStatus.PROCESSING })
  status: InvoiceStatus;

  @Prop({ required: false })
  paymentMethod?: string; // 'STRIPE', 'RAZORPAY', 'MANUAL', 'CREDIT_CARD'

  @Prop({ required: false })
  transactionId?: string; // Payment gateway transaction ID

  @Prop({ required: false })
  stripeInvoiceId?: string; // Stripe invoice ID

  @Prop({ required: false })
  razorpayPaymentId?: string; // Razorpay payment ID

  @Prop({ type: Object, required: false })
  lineItems?: {
    description: string;
    quantity: number;
    amount: number;
  }[];

  @Prop({ required: false })
  refundedAmount?: number;

  @Prop({ required: false })
  refundedOn?: Date;

  @Prop({ required: false })
  notes?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

// Indexes
InvoiceSchema.index({ tenantId: 1 });
InvoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ paidOn: 1 });
InvoiceSchema.index({ tenantId: 1, status: 1 }); // Composite index

