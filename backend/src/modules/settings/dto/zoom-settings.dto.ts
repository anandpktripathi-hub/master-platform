import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ZoomSettingsDto {
  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  clientSecret?: string;
}

export class UpdateZoomSettingsDto extends ZoomSettingsDto {}
