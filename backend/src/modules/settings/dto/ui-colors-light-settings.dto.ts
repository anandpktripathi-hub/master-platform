import { IsOptional, IsString } from 'class-validator';

export class UiColorsLightSettingsDto {
  siteMainColor1!: string;
  siteMainColor1Rgba?: string;
  siteMainColor2!: string;
  siteMainColor3!: string;
  headingColor!: string;
  headingColorRgb?: string;
  paragraphColor1!: string;
  paragraphColor2!: string;
  paragraphColor3!: string;
  paragraphColor4!: string;
}

export class UpdateUiColorsLightSettingsDto {
  @IsString()
  siteMainColor1!: string;

  @IsOptional()
  @IsString()
  siteMainColor1Rgba?: string;

  @IsString()
  siteMainColor2!: string;

  @IsString()
  siteMainColor3!: string;

  @IsString()
  headingColor!: string;

  @IsOptional()
  @IsString()
  headingColorRgb?: string;

  @IsString()
  paragraphColor1!: string;

  @IsString()
  paragraphColor2!: string;

  @IsString()
  paragraphColor3!: string;

  @IsString()
  paragraphColor4!: string;
}
