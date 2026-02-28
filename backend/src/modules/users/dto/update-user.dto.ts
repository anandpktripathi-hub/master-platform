import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { RoleUnion } from '../role.types';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  role?: RoleUnion;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}