import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { RoleUnion } from '../role.types';

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  // Role is optional; service will default to Role.USER
  @IsOptional()
  @IsString()
  role?: RoleUnion;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  company?: string;

  // Optional for platform admin creation / seed operations
  @IsOptional()
  @IsString()
  tenantId?: string;
}

export class BulkCreateUserDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserDto)
  users!: CreateUserDto[];
}
