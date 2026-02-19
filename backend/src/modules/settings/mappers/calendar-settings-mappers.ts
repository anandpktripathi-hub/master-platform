import { SettingEntryDto } from '../dto/upsert-settings.dto';
import {
  CalendarSettingsDto,
  UpdateCalendarSettingsDto,
} from '../dto/calendar-settings.dto';

export const CALENDAR_KEY = 'calendar.settings';

export function calendarDtoToEntries(
  dto: UpdateCalendarSettingsDto,
): SettingEntryDto[] {
  return [{ key: CALENDAR_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToCalendarDto(
  items: Record<string, unknown>,
): CalendarSettingsDto {
  const raw = ((items && items[CALENDAR_KEY]) || {}) as Record<string, any>;
  return {
    enabled: Boolean(raw.enabled),
    googleCalendarId: (raw.googleCalendarId as string) || '',
    googleServiceAccountJson: (raw.googleServiceAccountJson as string) || '',
  };
}
