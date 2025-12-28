import { IsBoolean } from 'class-validator';

export class UiTogglesSettingsDto {
  darkModeAdmin!: boolean;
  stickyNavbar!: boolean;
  adminNavSticky!: boolean;
  maintenanceMode!: boolean;
  mouseCursorEffect!: boolean;
  sectionTitleExtraDesign!: boolean;
  languageSelectorVisible!: boolean;
  backendPreloaderEnabled!: boolean;
  paymentGatewayEnabled!: boolean;
  forceSSLRedirect!: boolean;
  requireEmailVerification!: boolean;
}

export class UpdateUiTogglesSettingsDto {
  @IsBoolean()
  darkModeAdmin!: boolean;

  @IsBoolean()
  stickyNavbar!: boolean;

  @IsBoolean()
  adminNavSticky!: boolean;

  @IsBoolean()
  maintenanceMode!: boolean;

  @IsBoolean()
  mouseCursorEffect!: boolean;

  @IsBoolean()
  sectionTitleExtraDesign!: boolean;

  @IsBoolean()
  languageSelectorVisible!: boolean;

  @IsBoolean()
  backendPreloaderEnabled!: boolean;

  @IsBoolean()
  paymentGatewayEnabled!: boolean;

  @IsBoolean()
  forceSSLRedirect!: boolean;

  @IsBoolean()
  requireEmailVerification!: boolean;
}
