import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TicketDocument = Ticket & Document;

@Schema({ timestamps: true })
export class Ticket {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  subject!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open',
  })
  status!: 'open' | 'in_progress' | 'resolved' | 'closed';

  @Prop({ type: String, enum: ['low', 'medium', 'high'], default: 'low' })
  priority!: 'low' | 'medium' | 'high';

  @Prop({ required: false })
  tenantId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  assignedToUserId?: Types.ObjectId;

  @Prop({
    type: [
      {
        authorId: { type: Types.ObjectId, ref: 'User' },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  internalNotes?: Array<{
    authorId?: Types.ObjectId;
    message: string;
    createdAt: Date;
  }>;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
