import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RoleUnion, Role } from '../../modules/users/role.types';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name!: string;

  // NOTE: Do NOT use a global unique index on email in a multi-tenant app.
  // Uniqueness is enforced via compound index (email + tenantId).
  @Prop({ required: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ default: false })
  emailVerified!: boolean;

  @Prop({ required: false })
  previewTemplate?: string;

  // Core RBAC roles:
  // - platform_admin  -> Anand Ji (landlord, 100%)
  // - tenant_admin    -> Sudama Ji / tenant owner (90%)
  // - staff           -> staff/employee inside tenant (45%)
  // - customer        -> end customer / portal user (8%)
  @Prop({
    type: String,
    enum: [
      Role.USER,
      Role.ADMIN,
      Role.OWNER,
      Role.PLATFORM_SUPER_ADMIN,
      Role.PLATFORM_ADMIN_LEGACY,
      Role.TENANT_ADMIN_LEGACY,
      Role.STAFF_LEGACY,
      Role.CUSTOMER_LEGACY,
    ],
    default: Role.USER,
  })
  role!: RoleUnion;

  @Prop({ type: Types.ObjectId, ref: 'Tenant', required: false })
  tenantId!: Types.ObjectId;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: '' })
  company!: string;

  // Personal Profile Fields (Step 1 of registration)
  @Prop({ required: false })
  firstName!: string;

  @Prop({ required: false })
  secondName!: string; // middle name

  @Prop({ required: false })
  lastName!: string;

  @Prop({ required: false })
  dateOfBirth!: Date;

  @Prop({ required: false, unique: true, sparse: true })
  username?: string; // unique username for login

  @Prop({ required: false })
  phone?: string;

  @Prop({ required: false })
  homeAddress?: string;

  // Company-related user fields (Step 2 of registration)
  @Prop({ required: false })
  positionInCompany?: string;

  @Prop({ required: false })
  companyEmailForUser?: string; // work email

  @Prop({ required: false })
  companyPhoneForUser?: string; // work phone

  @Prop({ required: false })
  companyIdNumberForUser?: string; // employee ID

  @Prop({ type: Object, required: false })
  oauth?: Record<string, any>;
}

export const UserSchema = SchemaFactory.createForClass(User);
// Compound unique index for email+tenantId
UserSchema.index({ email: 1, tenantId: 1 }, { unique: true });
