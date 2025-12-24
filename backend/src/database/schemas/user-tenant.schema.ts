import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserTenantDocument = UserTenant & Document;

// Tracks which users belong to which tenants and their roles
@Schema({ timestamps: true })
export class UserTenant {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: true })
  tenantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  roleId: Types.ObjectId;

  // Allow/disallow login for this user in this tenant
  @Prop({ default: true })
  isLoginEnabled?: boolean;

  @Prop({ enum: ['active', 'inactive', 'suspended'], default: 'active' })
  status?: string;

  // Track last login
  @Prop({ required: false })
  lastLoginAt?: Date;

  // For landlord platform employees
  @Prop({ default: false })
  isPlatformUser?: boolean;
}

export const UserTenantSchema = SchemaFactory.createForClass(UserTenant);

// Unique constraint: one user can only have one active role per tenant
UserTenantSchema.index({ userId: 1, tenantId: 1 }, { unique: true });
