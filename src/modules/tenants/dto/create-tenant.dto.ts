import { IsEmail, IsIn, IsOptional, IsString, Length } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsIn(['FREE', 'BASIC', 'PRO', 'ENTERPRISE'])
  plan?: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';

  @IsOptional()
  @IsIn(['ACTIVE', 'SUSPENDED', 'TRIAL', 'CANCELLED'])
  status?: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'CANCELLED';

  @IsEmail()
  ownerEmail: string;
}
