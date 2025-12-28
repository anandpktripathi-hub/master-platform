import { SettingEntryDto } from '../dto/upsert-settings.dto';
import {
  SystemSettingsDto,
  UpdateSystemSettingsDto,
} from '../dto/system-settings.dto';

export const SYSTEM_KEY = 'system.settings';

export function systemDtoToEntries(
  dto: UpdateSystemSettingsDto,
): SettingEntryDto[] {
  return [{ key: SYSTEM_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToSystemDto(
  items: Record<string, unknown>,
): SystemSettingsDto {
  const raw = ((items && items[SYSTEM_KEY]) || {}) as Record<string, unknown>;
  return {
    defaultLanguage: (raw.defaultLanguage as string) || '',
    dateFormat: (raw.dateFormat as string) || '',
    timeFormat: (raw.timeFormat as string) || '',
    calendarStartDay: (raw.calendarStartDay as string) || '',
    defaultTimezone: (raw.defaultTimezone as string) || '',
  };
}
