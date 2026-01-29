import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserPostDocument = UserPost & Document;

@Schema({ timestamps: true })
export class UserPost {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId!: Types.ObjectId;

  @Prop({ type: String, required: true })
  content!: string;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  likes!: Types.ObjectId[];

  @Prop({ type: Number, default: 0 })
  likeCount!: number;

  @Prop({ type: Number, default: 0 })
  commentCount!: number;

  @Prop({
    type: String,
    enum: ['PUBLIC', 'CONNECTIONS_ONLY', 'PRIVATE'],
    default: 'PUBLIC',
  })
  visibility!: 'PUBLIC' | 'CONNECTIONS_ONLY' | 'PRIVATE';
}

export const UserPostSchema = SchemaFactory.createForClass(UserPost);
