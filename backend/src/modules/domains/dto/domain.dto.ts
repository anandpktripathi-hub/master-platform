import { IsString, IsEnum, IsOptional, IsMongoId } from 'class-validator';

export class CreateDomainDto {
  @IsString()
  tenantId!: string; // For admin creating on behalf of tenant

  @IsEnum(['path', 'subdomain'])
  type!: 'path' | 'subdomain';

  @IsString()
  value!: string; // slug/subdomain part

  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class UpdateDomainDto {
  @IsOptional()
  @IsEnum(['pending', 'active', 'suspended', 'blocked'])
  status?: string;

  @IsOptional()
  isPrimary?: boolean;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class SetPrimaryDomainDto {
  @IsMongoId()
  domainId!: string;
}

export class ListDomainsQueryDto {
  @IsOptional()
  @IsEnum(['path', 'subdomain'])
  type?: 'path' | 'subdomain';

  @IsOptional()
  @IsEnum(['pending', 'active', 'suspended', 'blocked'])
  status?: string;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  isPrimary?: boolean;

  @IsOptional()
  limit?: number;

  @IsOptional()
  skip?: number;
}

export class DomainResponseDto {
  _id!: string;
  tenantId!: string;
  type!: 'path' | 'subdomain';
  value!: string;
  status!: string;
  isPrimary!: boolean;
  computedUrl?: string; // Computed based on type
  createdBy?: string;
  updatedBy?: string;
  createdAt!: Date;
  updatedAt!: Date;
  dnsProvider?: string;
  dnsSyncedAt?: Date;
  dnsLastError?: string;
}
