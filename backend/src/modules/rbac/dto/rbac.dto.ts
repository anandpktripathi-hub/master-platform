import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsMongoId,
  IsEnum,
  IsDateString,
} from 'class-validator';
import {
  PermissionAction,
  ModuleName,
} from '../../../database/schemas/permission.schema';


export class CreatePermissionDto {
  @IsEnum(['manage', 'create', 'edit', 'delete', 'show'])
  action!: PermissionAction;

  @IsString()
  module!: ModuleName;

  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Optional: List of allowed fields for this permission (for per-field access control)
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];
}


export class PermissionDto {
  _id!: string;
  action!: PermissionAction;
  module!: ModuleName;
  description?: string;
  fields?: string[];
}

export class CreateRoleDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @IsMongoId({ each: true })
  permissionIds!: string[];
}

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  permissionIds?: string[];
}

export class RoleDto {
  _id!: string;
  name!: string;
  description?: string;
  tenantId?: string;
  isSystem?: boolean;
  permissions!: PermissionDto[];
  isActive?: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsString()
  email!: string;

  @IsString()
  password!: string;

  @IsMongoId()
  tenantId!: string;

  @IsMongoId()
  roleId!: string;

  @IsOptional()
  @IsBoolean()
  isLoginEnabled?: boolean;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsMongoId()
  roleId?: string;

  @IsOptional()
  @IsBoolean()
  isLoginEnabled?: boolean;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}

export class UserTenantDto {
  _id!: string;
  userId!: string;
  tenantId!: string;
  roleId!: string;
  isLoginEnabled!: boolean;
  status!: string;
  lastLoginAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;
}

export class ResetPasswordDto {
  @IsString()
  newPassword!: string;
}
