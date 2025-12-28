import { SettingEntryDto } from '../dto/upsert-settings.dto';
import {
  EmailSettingsDto,
  UpdateEmailSettingsDto,
} from '../dto/email-settings.dto';

export const EMAIL_KEY = 'email.settings';

export function emailDtoToEntries(
  dto: UpdateEmailSettingsDto,
): SettingEntryDto[] {
  return [{ key: EMAIL_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToEmailDto(
  items: Record<string, unknown>,
): EmailSettingsDto {
  const raw = ((items && items[EMAIL_KEY]) || {}) as Record<string, unknown>;
  return {
    globalFromEmail: (raw.globalFromEmail as string) || '',
    smtpHost: (raw.smtpHost as string) || '',
    smtpUsername: (raw.smtpUsername as string) || '',
    smtpPassword: (raw.smtpPassword as string) || '',
    smtpDriver: (raw.smtpDriver as string) || '',
    smtpPort: Number(raw.smtpPort) || 0,
    smtpEncryption: (raw.smtpEncryption as 'ssl' | 'tls' | 'none') || 'none',
  };
}
