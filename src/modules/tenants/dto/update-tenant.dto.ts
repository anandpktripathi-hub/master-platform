import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTenantDto {
  @IsOptional()
  @IsIn(['ACTIVE', 'SUSPENDED', 'TRIAL', 'CANCELLED'])
  status?: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'CANCELLED';

  @IsOptional()
  @IsIn(['FREE', 'BASIC', 'PRO', 'ENTERPRISE'])
  plan?: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';

  @IsOptional()
  @IsString()
  domain?: string | null;

  @IsOptional()
  @IsNumber()
  maxUsers?: number;

  @IsOptional()
  @IsNumber()
  maxStorageMB?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
