import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class ApplicationSettingsDto {
  @IsString()
  appName!: string;

  @IsString()
  appTimezone!: string;

  @IsBoolean()
  isLiveServer!: boolean;

  @IsBoolean()
  appDebug!: boolean;

  @IsNumber()
  subscriptionExpiryWarningDays!: number;
}

export class UpdateApplicationSettingsDto extends ApplicationSettingsDto {}
