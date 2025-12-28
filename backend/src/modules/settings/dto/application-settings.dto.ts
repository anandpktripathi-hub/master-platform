import { IsBoolean, IsString } from 'class-validator';

export class ApplicationSettingsDto {
  @IsString()
  appName!: string;

  @IsString()
  appTimezone!: string;

  @IsBoolean()
  isLiveServer!: boolean;

  @IsBoolean()
  appDebug!: boolean;
}

export class UpdateApplicationSettingsDto extends ApplicationSettingsDto {}
