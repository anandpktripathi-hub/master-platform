import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const USER_ROLES = [
  'user',
  'admin',
  'owner',
  'PLATFORM_SUPER_ADMIN',
  'platform_admin',
  'tenant_admin',
  'staff',
  'customer',
] as const;

export class CreateTenantUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(200)
  password!: string;

  @IsOptional()
  @IsIn(USER_ROLES as unknown as string[])
  role?: (typeof USER_ROLES)[number];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTenantUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(200)
  password?: string;

  @IsOptional()
  @IsIn(USER_ROLES as unknown as string[])
  role?: (typeof USER_ROLES)[number];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

