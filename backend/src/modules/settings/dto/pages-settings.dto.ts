import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PagesSettingsDto {
  @IsOptional()
  @IsString()
  homePageId!: string | null;

  @IsOptional()
  @IsString()
  pricingPageId!: string | null;

  @IsBoolean()
  enableLandingPage!: boolean;

  @IsBoolean()
  enableSignup!: boolean;

  @IsBoolean()
  enableRTL!: boolean;

  @IsBoolean()
  layoutDark!: boolean;

  @IsBoolean()
  sidebarTransparent!: boolean;

  @IsBoolean()
  categoryWiseSidemenu!: boolean;
}

export class UpdatePagesSettingsDto extends PagesSettingsDto {}
