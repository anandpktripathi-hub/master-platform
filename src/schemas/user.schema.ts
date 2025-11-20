import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  TENANT_OWNER = 'tenant_owner',
  TENANT_ADMIN = 'tenant_admin',
  TENANT_USER = 'tenant_user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.TENANT_USER })
  role: UserRole;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', default: null })
  tenantId: Types.ObjectId;

  @Prop({ default: null })
  profileImage: string;

  @Prop({ default: null })
  phoneNumber: string;

  @Prop({ type: Object, default: {} })
  preferences: Record<string, any>;

  @Prop({ default: null })
  lastLoginAt: Date;

  @Prop({ default: null })
  emailVerifiedAt: Date;

  @Prop({ default: null })
  emailVerificationToken: string;

  @Prop({ default: null })
  passwordResetToken: string;

  @Prop({ default: null })
  passwordResetExpires: Date;

  @Prop({ default: false })
  isTwoFactorEnabled: boolean;

  @Prop({ default: null })
  twoFactorSecret: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 });
UserSchema.index({ tenantId: 1 });
UserSchema.index({ role: 1, status: 1 });
