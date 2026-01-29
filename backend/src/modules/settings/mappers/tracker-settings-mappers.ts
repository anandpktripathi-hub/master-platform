import { SettingEntryDto } from '../dto/upsert-settings.dto';
import {
  TrackerSettingsDto,
  UpdateTrackerSettingsDto,
} from '../dto/tracker-settings.dto';

export const TRACKER_KEY = 'tracker.settings';

export function trackerDtoToEntries(
  dto: UpdateTrackerSettingsDto,
): SettingEntryDto[] {
  return [{ key: TRACKER_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToTrackerDto(
  items: Record<string, unknown>,
): TrackerSettingsDto {
  const raw = ((items && items[TRACKER_KEY]) || {}) as Record<string, any>;
  return {
    enabled: Boolean(raw.enabled),
    appUrl: (raw.appUrl as string) || '',
    screenshotIntervalMinutes: Number(raw.screenshotIntervalMinutes) || 0,
    notes: (raw.notes as string) || '',
  };
}
