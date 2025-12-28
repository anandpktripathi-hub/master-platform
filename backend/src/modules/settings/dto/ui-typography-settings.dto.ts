import { IsArray, IsBoolean, IsString } from 'class-validator';

export class UiTypographySettingsDto {
  useCustomFont!: boolean;
  bodyFontFamily!: string;
  bodyFontVariants!: string[];
  useHeadingFont!: boolean;
  headingFontFamily!: string;
  headingFontVariants!: string[];
}

export class UpdateUiTypographySettingsDto {
  @IsBoolean()
  useCustomFont!: boolean;

  @IsString()
  bodyFontFamily!: string;

  @IsArray()
  @IsString({ each: true })
  bodyFontVariants!: string[];

  @IsBoolean()
  useHeadingFont!: boolean;

  @IsString()
  headingFontFamily!: string;

  @IsArray()
  @IsString({ each: true })
  headingFontVariants!: string[];
}
