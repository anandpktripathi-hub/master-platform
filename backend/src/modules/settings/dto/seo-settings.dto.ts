import { IsArray, IsOptional, IsString } from 'class-validator';

export class SeoSettingsDto {
  @IsString()
  metaTitle!: string;

  @IsArray()
  @IsString({ each: true })
  metaTags!: string[];

  @IsArray()
  @IsString({ each: true })
  metaKeywords!: string[];

  @IsString()
  metaDescription!: string;

  @IsString()
  ogTitle!: string;

  @IsString()
  ogDescription!: string;

  @IsString()
  ogImage!: string;

  @IsOptional()
  @IsString()
  canonicalType!: string;
}

export class UpdateSeoSettingsDto extends SeoSettingsDto {}
