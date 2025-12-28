import { IsString } from 'class-validator';

export class SystemSettingsDto {
  @IsString()
  defaultLanguage!: string;

  @IsString()
  dateFormat!: string;

  @IsString()
  timeFormat!: string;

  @IsString()
  calendarStartDay!: string;

  @IsString()
  defaultTimezone!: string;
}

export class UpdateSystemSettingsDto extends SystemSettingsDto {}
