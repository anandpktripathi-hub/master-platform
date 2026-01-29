import { IsOptional, IsString, IsObject } from 'class-validator';

export class UploadThemeDto {
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  faviconUrl?: string;

  @IsOptional()
  @IsObject()
  colors?: Record<string, string>;

  @IsOptional()
  @IsString()
  fontFamily?: string;

  @IsOptional()
  @IsString()
  customCss?: string;

  @IsOptional()
  @IsString()
  customJs?: string;

  @IsOptional()
  @IsString()
  preloaderLottieUrl?: string;

  @IsOptional()
  @IsString()
  letterheadUrl?: string;

  @IsOptional()
  @IsString()
  digitalSignatureUrl?: string;

  @IsOptional()
  @IsObject()
  emailTemplates?: Record<string, string>;
}
