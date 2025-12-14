import {
  IsString,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
  ValidateNested,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  PersonalInfoDto,
  CompanyInfoDto,
  ComplianceDto,
} from '../../auth/dto/tenant-register.dto';

/**
 * Manual Tenant Creation by Platform Admin
 * Allows optional password and additional control flags
 */
export class ManualCreateTenantDto {
  @ValidateNested()
  @Type(() => PersonalInfoDto)
  personal: PersonalInfoDto;

  @ValidateNested()
  @Type(() => CompanyInfoDto)
  company: CompanyInfoDto;

  @ValidateNested()
  @Type(() => ComplianceDto)
  compliance: ComplianceDto;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password?: string; // Optional: if not provided, generates temp password or sends invite

  @IsOptional()
  @IsString()
  planId?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, {
    message:
      'Subdomain can only contain lowercase letters, numbers, and hyphens',
  })
  subdomain: string;

  @IsOptional()
  @IsBoolean()
  skipPayment?: boolean; // If true, tenant won't need immediate payment setup

  @IsOptional()
  @IsBoolean()
  sendInviteEmail?: boolean; // If true, sends invitation email to set password
}
