import { SettingEntryDto } from '../dto/upsert-settings.dto';
import {
  ApplicationSettingsDto,
  UpdateApplicationSettingsDto,
} from '../dto/application-settings.dto';

export const APPLICATION_KEY = 'application.settings';

export function applicationDtoToEntries(
  dto: UpdateApplicationSettingsDto,
): SettingEntryDto[] {
  return [{ key: APPLICATION_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToApplicationDto(
  items: Record<string, unknown>,
): ApplicationSettingsDto {
  const raw = ((items && items[APPLICATION_KEY]) || {}) as Record<
    string,
    unknown
  >;
  return {
    appName: (raw.appName as string) || '',
    appTimezone: (raw.appTimezone as string) || '',
    isLiveServer: Boolean(raw.isLiveServer),
    appDebug: Boolean(raw.appDebug),
    subscriptionExpiryWarningDays: (() => {
      const num = Number(raw.subscriptionExpiryWarningDays);
      return !Number.isNaN(num) && num > 0 ? num : 3;
    })(),
  };
}
