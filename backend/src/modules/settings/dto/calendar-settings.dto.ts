import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CalendarSettingsDto {
  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsString()
  googleCalendarId?: string;

  @IsOptional()
  @IsString()
  googleServiceAccountJson?: string;
}

export class UpdateCalendarSettingsDto extends CalendarSettingsDto {}
