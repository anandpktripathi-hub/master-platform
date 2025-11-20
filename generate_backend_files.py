import os

FILES_TO_CREATE = [
    # SCHEMAS
    ("src/schemas/user.schema.ts", '''<FILES_TO_CREATE = [
    (
        "src/schemas/user.schema.ts",
        '''
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
'''
    ),
    # ... next file tuple
]
>'''),
    ("src/schemas/tenant.schema.ts", '''<Paste your tenant.schema.ts content here>'''),
    # AUTH MODULE FILES
    ("src/auth/auth.module.ts", '''<Paste your auth.module.ts content here>'''),
    ("src/auth/auth.service.ts", '''<Paste your auth.service.ts content here>'''),
    ("src/auth/auth.controller.ts", '''<Paste your auth.controller.ts content here>'''),
    # DTOs
    ("src/auth/dto/register.dto.ts", '''<Paste your register.dto.ts content here>'''),
    ("src/auth/dto/login.dto.ts", '''<Paste your login.dto.ts content here>'''),
    ("src/auth/dto/change-password.dto.ts", '''<Paste your change-password.dto.ts content here>'''),
    ("src/auth/dto/request-password-reset.dto.ts", '''<Paste your request-password-reset.dto.ts content here>'''),
    ("src/auth/dto/reset-password.dto.ts", '''<Paste your reset-password.dto.ts content here>'''),
    # STRATEGIES
    ("src/auth/strategies/jwt.strategy.ts", '''<Paste your jwt.strategy.ts content here>'''),
    ("src/auth/strategies/local.strategy.ts", '''<Paste your local.strategy.ts content here>'''),
    # GUARDS
    ("src/auth/guards/jwt-auth.guard.ts", '''<Paste your jwt-auth.guard.ts content here>'''),
    ("src/auth/guards/roles.guard.ts", '''<Paste your roles.guard.ts content here>'''),
    # DECORATORS
    ("src/auth/decorators/roles.decorator.ts", '''<Paste your roles.decorator.ts content here>'''),
    # Add additional schema/controller/service files for other modules as needed
]

def safe_write(rel_path, content):
    folder = os.path.dirname(rel_path)
    if folder and not os.path.exists(folder):
        os.makedirs(folder)
    with open(rel_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Created: {rel_path}")

for rel_path, content in FILES_TO_CREATE:
    # Skip files if you have not pasted their content yet
    if not content.startswith('<Paste'):
        safe_write(rel_path, content)
    else:
        print(f"Skipped: {rel_path} (paste your code!)")

print("\nAll backend files generated! Run: npm run start:dev\n")
