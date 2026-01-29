import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class TrackerSettingsDto {
  @IsBoolean()
  enabled!: boolean;

  @IsString()
  appUrl!: string;

  @IsNumber()
  screenshotIntervalMinutes!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTrackerSettingsDto extends TrackerSettingsDto {}
