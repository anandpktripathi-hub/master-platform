import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;

export type TransactionType = 'debit' | 'credit';

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  accountId!: Types.ObjectId;

  @Prop({ required: true })
  amount!: number;

  @Prop({ type: String, required: true, enum: ['debit', 'credit'] })
  type!: TransactionType;

  @Prop({ type: Date, required: true })
  date!: Date;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
TransactionSchema.index({ tenantId: 1, accountId: 1, date: 1 });
