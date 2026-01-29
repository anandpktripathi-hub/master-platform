import { SettingEntryDto } from '../dto/upsert-settings.dto';
import {
  WebhookSettingsDto,
  UpdateWebhookSettingsDto,
  WebhookConfigDto,
} from '../dto/webhook-settings.dto';

export const WEBHOOK_KEY = 'webhook.settings';

export function webhookDtoToEntries(
  dto: UpdateWebhookSettingsDto,
): SettingEntryDto[] {
  return [{ key: WEBHOOK_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToWebhookDto(
  items: Record<string, unknown>,
): WebhookSettingsDto {
  const raw = ((items && items[WEBHOOK_KEY]) || {}) as Record<string, any>;

  const hooksRaw = (raw.hooks || {}) as Record<
    string,
    Partial<WebhookConfigDto>
  >;
  const hooks: Record<string, WebhookConfigDto> = {};

  for (const [eventKey, cfg] of Object.entries(hooksRaw)) {
    hooks[eventKey] = {
      url: cfg.url || '',
      enabled: Boolean(cfg.enabled),
      secretHeaderName: cfg.secretHeaderName ?? '',
      secretHeaderValue: cfg.secretHeaderValue ?? '',
    };
  }

  return {
    hooks,
  };
}
