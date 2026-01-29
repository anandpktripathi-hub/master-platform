import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AccountDocument = Account & Document;

export type AccountType =
  | 'asset'
  | 'liability'
  | 'equity'
  | 'income'
  | 'expense';

@Schema({ timestamps: true })
export class Account {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: false })
  code!: string;

  @Prop({ required: true, enum: ['asset', 'liability', 'equity', 'income', 'expense'] })
  type!: AccountType;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
AccountSchema.index({ tenantId: 1, code: 1 }, { unique: true });
