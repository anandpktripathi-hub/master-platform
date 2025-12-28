import { IsString } from 'class-validator';

export class UiColorsDarkSettingsDto {
  backgroundLightColor1!: string;
  backgroundLightColor2!: string;
  backgroundDarkColor1!: string;
  backgroundDarkColor2!: string;
  secondaryColor!: string;
  baseColor2!: string;
  mainColor5!: string;
}

export class UpdateUiColorsDarkSettingsDto {
  @IsString()
  backgroundLightColor1!: string;

  @IsString()
  backgroundLightColor2!: string;

  @IsString()
  backgroundDarkColor1!: string;

  @IsString()
  backgroundDarkColor2!: string;

  @IsString()
  secondaryColor!: string;

  @IsString()
  baseColor2!: string;

  @IsString()
  mainColor5!: string;
}
