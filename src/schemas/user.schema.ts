import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type UserRole = 'TENANT_OWNER' | 'ADMIN' | 'USER';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenant: Types.ObjectId;

  @Prop({ default: 'USER' })
  role: UserRole;

  @Prop({ default: 'ACTIVE' })
  status: UserStatus;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Date, required: false })
  lastLoginAt?: Date;

  @Prop({ type: String, required: false, default: null })
  resetPasswordToken?: string | null;

  @Prop({ type: Date, required: false, default: null })
  resetPasswordExpires?: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
