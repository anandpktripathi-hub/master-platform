import { Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: ['admin', 'owner', 'user'], default: 'user' })
  role: string;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: false })
  tenantId?: Types.ObjectId;

  @Prop({ default: true })
  isActive?: boolean;

  @Prop({ default: '' })
  company?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

















