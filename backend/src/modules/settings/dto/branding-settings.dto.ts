import { IsString } from 'class-validator';

export class BrandingSettingsDto {
  @IsString()
  siteLogo!: string;

  @IsString()
  siteWhiteLogo!: string;

  @IsString()
  favicon!: string;

  @IsString()
  logoDark!: string;

  @IsString()
  logoLight!: string;

  @IsString()
  brandFavicon!: string;

  @IsString()
  titleText!: string;

  @IsString()
  footerText!: string;

  @IsString()
  breadcrumbImageLeft!: string;

  @IsString()
  breadcrumbImageRight!: string;

  @IsString()
  mainHeroImage!: string;
}

export class UpdateBrandingSettingsDto extends BrandingSettingsDto {}
