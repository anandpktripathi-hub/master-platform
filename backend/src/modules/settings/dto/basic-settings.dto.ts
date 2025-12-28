import { IsString } from 'class-validator';

export class BasicSettingsDto {
  @IsString()
  siteTitle!: string;

  @IsString()
  siteTagLine!: string;

  @IsString()
  footerCopyright!: string;

  @IsString()
  siteLogo!: string;

  @IsString()
  siteWhiteLogo!: string;

  @IsString()
  siteFavicon!: string;
}

export class UpdateBasicSettingsDto extends BasicSettingsDto {}
