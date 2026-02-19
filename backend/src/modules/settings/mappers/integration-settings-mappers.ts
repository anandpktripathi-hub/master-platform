import { SettingEntryDto } from '../dto/upsert-settings.dto';
import {
  IntegrationSettingsDto,
  UpdateIntegrationSettingsDto,
  SlackIntegrationSettingsDto,
  TelegramIntegrationSettingsDto,
  TwilioIntegrationSettingsDto,
} from '../dto/integration-settings.dto';

export const INTEGRATION_KEY = 'integration.settings';

export function integrationDtoToEntries(
  dto: UpdateIntegrationSettingsDto,
): SettingEntryDto[] {
  return [{ key: INTEGRATION_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToIntegrationDto(
  items: Record<string, unknown>,
): IntegrationSettingsDto {
  const raw = ((items && items[INTEGRATION_KEY]) || {}) as Record<string, any>;

  const slackRaw = (raw.slack || {}) as Partial<SlackIntegrationSettingsDto>;
  const telegramRaw = (raw.telegram ||
    {}) as Partial<TelegramIntegrationSettingsDto>;
  const twilioRaw = (raw.twilio || {}) as Partial<TwilioIntegrationSettingsDto>;

  return {
    slack: {
      enabled: Boolean(slackRaw.enabled),
      webhookUrl: slackRaw.webhookUrl ?? '',
    },
    telegram: {
      enabled: Boolean(telegramRaw.enabled),
      botToken: telegramRaw.botToken ?? '',
      chatId: telegramRaw.chatId ?? '',
    },
    twilio: {
      enabled: Boolean(twilioRaw.enabled),
      accountSid: twilioRaw.accountSid ?? '',
      authToken: twilioRaw.authToken ?? '',
      fromNumber: twilioRaw.fromNumber ?? '',
    },
  };
}
