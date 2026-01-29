import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class WebhookConfigDto {
  @IsString()
  url!: string;

  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsString()
  secretHeaderName?: string;

  @IsOptional()
  @IsString()
  secretHeaderValue?: string;
}

export class WebhookSettingsDto {
  hooks!: Record<string, WebhookConfigDto>;
}

export class UpdateWebhookSettingsDto extends WebhookSettingsDto {}
