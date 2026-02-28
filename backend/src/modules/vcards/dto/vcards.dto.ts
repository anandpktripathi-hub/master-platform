import {
  IsArray,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VCardSocialLinkDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  label!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2048)
  @IsUrl({ require_protocol: true })
  url!: string;
}

export class CreateVCardDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  displayName!: string;

  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  jobTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  companyName?: string;

  @IsOptional()
  @IsEmail()
  primaryEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  primaryPhone?: string;

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  emails?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  phones?: string[];

  @IsOptional()
  @IsUrl({ require_protocol: true })
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  addressLine1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  addressLine2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  country?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VCardSocialLinkDto)
  socialLinks?: VCardSocialLinkDto[];
}

export class UpdateVCardDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  displayName?: string;

  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  jobTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  companyName?: string;

  @IsOptional()
  @IsEmail()
  primaryEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  primaryPhone?: string;

  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  emails?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  phones?: string[];

  @IsOptional()
  @IsUrl({ require_protocol: true })
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  addressLine1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  addressLine2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  country?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VCardSocialLinkDto)
  socialLinks?: VCardSocialLinkDto[];
}
