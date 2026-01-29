import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatRoomMemberDocument = ChatRoomMember & Document;

@Schema({ timestamps: true })
export class ChatRoomMember {
  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ChatRoom', required: true })
  roomId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ default: 'member' })
  role!: 'member' | 'admin';
}

export const ChatRoomMemberSchema = SchemaFactory.createForClass(ChatRoomMember);
ChatRoomMemberSchema.index({ tenantId: 1, roomId: 1, userId: 1 }, { unique: true });
