import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SlackIntegrationSettingsDto {
  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsString()
  webhookUrl?: string;
}

export class TelegramIntegrationSettingsDto {
  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsString()
  botToken?: string;

  @IsOptional()
  @IsString()
  chatId?: string;
}

export class TwilioIntegrationSettingsDto {
  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsString()
  accountSid?: string;

  @IsOptional()
  @IsString()
  authToken?: string;

  @IsOptional()
  @IsString()
  fromNumber?: string;
}

export class IntegrationSettingsDto {
  slack!: SlackIntegrationSettingsDto;
  telegram!: TelegramIntegrationSettingsDto;
  twilio!: TwilioIntegrationSettingsDto;
}

export class UpdateIntegrationSettingsDto extends IntegrationSettingsDto {}
