import { SettingEntryDto } from '../dto/upsert-settings.dto';
import {
  ZoomSettingsDto,
  UpdateZoomSettingsDto,
} from '../dto/zoom-settings.dto';

export const ZOOM_KEY = 'zoom.settings';

export function zoomDtoToEntries(
  dto: UpdateZoomSettingsDto,
): SettingEntryDto[] {
  return [{ key: ZOOM_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToZoomDto(
  items: Record<string, unknown>,
): ZoomSettingsDto {
  const raw = ((items && items[ZOOM_KEY]) || {}) as Record<string, any>;
  return {
    enabled: Boolean(raw.enabled),
    accountId: (raw.accountId as string) || '',
    clientId: (raw.clientId as string) || '',
    clientSecret: (raw.clientSecret as string) || '',
  };
}
