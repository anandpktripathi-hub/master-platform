import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export class QueryTenantDto {
  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'SUSPENDED', 'TRIAL', 'CANCELLED'])
  status?: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'CANCELLED';

  @IsOptional()
  @IsIn(['FREE', 'BASIC', 'PRO', 'ENTERPRISE'])
  plan?: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
}
