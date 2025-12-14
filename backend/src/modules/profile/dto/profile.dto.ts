import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';

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
