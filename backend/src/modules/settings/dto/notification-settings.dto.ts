import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class NotificationChannelSettingsDto {
  @IsBoolean()
  email!: boolean;

  @IsBoolean()
  inApp!: boolean;

  @IsBoolean()
  sms!: boolean;

  @IsOptional()
  @IsBoolean()
  push?: boolean;
}

export class NotificationSettingsDto {
  // High-level toggles per event type. Keys match business events.
  events!: Record<string, NotificationChannelSettingsDto>;

  @IsOptional()
  @IsString()
  defaultEmailTemplatePrefix?: string;
}

export class UpdateNotificationSettingsDto extends NotificationSettingsDto {}
