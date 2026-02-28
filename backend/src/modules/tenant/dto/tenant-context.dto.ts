import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TenantContextDto {
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  domain?: string;
}
