import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
  ValidateNested,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Step 1: Personal Information
 */
export class PersonalInfoDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  secondName?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;

  @IsDateString()
  dateOfBirth!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Username can only contain letters, numbers, hyphens, and underscores',
  })
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(200)
  homeAddress!: string;
}

/**
 * Step 2: Company Information
 */
export class CompanyInfoDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  companyName!: string;

  @IsOptional()
  @IsDateString()
  companyDateOfBirth?: string;

  @IsEmail()
  companyEmail!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(20)
  companyPhone!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(200)
  companyAddress!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  positionInCompany!: string;

  @IsOptional()
  @IsEmail()
  companyEmailForUser?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  companyPhoneForUser?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  companyIdNumberForUser?: string;
}

/**
 * Step 3: Compliance (Terms & Privacy)
 */
export class ComplianceDto {
  @IsBoolean()
  acceptedTerms!: boolean;

  @IsBoolean()
  acceptedPrivacy!: boolean;
}

/**
 * Complete 4-Step Registration Payload
 */
export class TenantRegisterDto {
  @ValidateNested()
  @Type(() => PersonalInfoDto)
  personal!: PersonalInfoDto;

  @ValidateNested()
  @Type(() => CompanyInfoDto)
  company!: CompanyInfoDto;

  @ValidateNested()
  @Type(() => ComplianceDto)
  compliance!: ComplianceDto;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password!: string;

  @IsOptional()
  @IsString()
  planId?: string; // Optional plan selection (defaults to FREE)

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, {
    message:
      'Subdomain can only contain lowercase letters, numbers, and hyphens',
  })
  subdomain!: string;
}
