import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateTenantPublicProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  publicName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  tagline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  shortDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  fullDescription?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsUrl()
  coverImageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @IsOptional()
  @IsEmail()
  contactEmailPublic?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactPhonePublic?: string;

  @IsOptional()
  @IsBoolean()
  isListedInDirectory?: boolean;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class TenantPublicProfileResponseDto {
  id!: string;
  slug!: string;
  name!: string;
  publicName?: string;
  tagline?: string;
  shortDescription?: string;
  fullDescription?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  categories?: string[];
  tags?: string[];
  websiteUrl?: string;
  contactEmailPublic?: string;
  contactPhonePublic?: string;
  city?: string;
  country?: string;
  planKey?: string;
  isActive!: boolean;
}
