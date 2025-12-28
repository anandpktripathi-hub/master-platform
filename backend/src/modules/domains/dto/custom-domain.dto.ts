import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateCustomDomainDto {
  @IsString()
  domain!: string; // e.g., example.com

  @IsOptional()
  @IsEnum(['TXT', 'CNAME'])
  verificationMethod!: 'TXT' | 'CNAME'; // Default: TXT
}

export class UpdateCustomDomainDto {
  @IsOptional()
  @IsEnum([
    'pending_verification',
    'verified',
    'ssl_pending',
    'ssl_issued',
    'active',
    'suspended',
  ])
  status!: string;

  @IsOptional()
  @IsString()
  notes!: string;
}

export class VerifyCustomDomainDto {
  @IsString()
  domain!: string;

  @IsString()
  verificationToken!: string; // Token tenant set in DNS
}

export class SetCustomDomainPrimaryDto {
  @IsString()
  domainId!: string;
}

export class CustomDomainResponseDto {
  _id!: string;
  tenantId!: string;
  domain!: string;
  status!: string;
  verificationToken!: string;
  verificationMethod!: 'TXT' | 'CNAME';
  dnsTarget!: string;
  lastVerifiedAt!: Date;
  sslStatus!: string;
  sslExpiresAt!: Date;
  sslIssuedAt!: Date;
  isPrimary!: boolean;
  dnsInstructions?: {
    method: string;
    target: string;
    instructions: string[];
  };
  createdAt!: Date;
  updatedAt!: Date;
}
