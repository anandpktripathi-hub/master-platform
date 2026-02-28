import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class VCardSocialLinkDto {
  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'url must include protocol' })
  url!: string;
}

export class CreateVCardDto {
  @IsString()
  @IsNotEmpty()
  displayName!: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsEmail()
  primaryEmail?: string;

  @IsOptional()
  @IsString()
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
  addressLine1?: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VCardSocialLinkDto)
  socialLinks?: VCardSocialLinkDto[];
}

export class UpdateVCardDto extends CreateVCardDto {}
