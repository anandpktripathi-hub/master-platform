import { SettingEntryDto } from '../dto/upsert-settings.dto';
import {
  BasicSettingsDto,
  UpdateBasicSettingsDto,
} from '../dto/basic-settings.dto';

export const BASIC_KEY = 'basic.settings';

export function basicDtoToEntries(
  dto: UpdateBasicSettingsDto,
): SettingEntryDto[] {
  return [{ key: BASIC_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToBasicDto(
  items: Record<string, unknown>,
): BasicSettingsDto {
  const raw = ((items && items[BASIC_KEY]) || {}) as Record<string, unknown>;
  return {
    siteTitle: (raw.siteTitle as string) || '',
    siteTagLine: (raw.siteTagLine as string) || '',
    footerCopyright: (raw.footerCopyright as string) || '',
    siteLogo: (raw.siteLogo as string) || '',
    siteWhiteLogo: (raw.siteWhiteLogo as string) || '',
    siteFavicon: (raw.siteFavicon as string) || '',
  };
}
