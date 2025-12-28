import { SettingEntryDto } from '../dto/upsert-settings.dto';
import {
  ReportsSettingsDto,
  UpdateReportsSettingsDto,
} from '../dto/reports-settings.dto';

export const REPORTS_KEY = 'reports.settings';

export function reportsDtoToEntries(
  dto: UpdateReportsSettingsDto,
): SettingEntryDto[] {
  return [{ key: REPORTS_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToReportsDto(
  items: Record<string, unknown>,
): ReportsSettingsDto {
  const raw = ((items && items[REPORTS_KEY]) || {}) as Record<string, unknown>;
  return {
    defaultStartMonthOffset: Number(raw.defaultStartMonthOffset) || 0,
    defaultStatusFilter: (Array.isArray(raw.defaultStatusFilter)
      ? raw.defaultStatusFilter
      : []) as string[],
  };
}
