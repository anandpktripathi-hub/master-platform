import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';

import { IsArray, IsUrl, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for updating user personal profile
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  secondName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  homeAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  positionInCompany?: string;

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
 * DTO for updating tenant/company profile
 */
export class UpdateTenantProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  companyName?: string;

  @IsOptional()
  @IsDateString()
  companyDateOfBirth?: string;

  @IsOptional()
  @IsEmail()
  companyEmail?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  companyPhone?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  companyAddress?: string;
}

export class ExperienceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  title!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  company!: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  isCurrent?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class LinkDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  label!: string;

  @IsUrl()
  url!: string;
}

export class UpdatePublicProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  handle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  headline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsUrl()
  bannerUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  currentTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  currentCompanyName?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experience?: ExperienceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  links?: LinkDto[];

  @IsOptional()
  @IsIn(['PUBLIC', 'NETWORK', 'PRIVATE'])
  visibility?: 'PUBLIC' | 'NETWORK' | 'PRIVATE';
}
