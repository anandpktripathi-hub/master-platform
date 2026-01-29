import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserConnectionDocument = UserConnection & Document;

@Schema({ timestamps: true })
export class UserConnection {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requesterId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recipientId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING',
  })
  status!: 'PENDING' | 'ACCEPTED' | 'REJECTED';

  @Prop({ type: Date })
  acceptedAt?: Date;
}

export const UserConnectionSchema = SchemaFactory.createForClass(UserConnection);

// Compound index for lookups (per tenant)
UserConnectionSchema.index(
  { tenantId: 1, requesterId: 1, recipientId: 1 },
  { unique: true },
);
