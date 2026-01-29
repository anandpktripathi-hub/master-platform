import { SettingEntryDto } from '../dto/upsert-settings.dto';
import {
  IpRestrictionSettingsDto,
  UpdateIpRestrictionSettingsDto,
} from '../dto/ip-restriction-settings.dto';

export const IP_RESTRICTION_KEY = 'ip-restriction.settings';

export function ipRestrictionDtoToEntries(
  dto: UpdateIpRestrictionSettingsDto,
): SettingEntryDto[] {
  return [{ key: IP_RESTRICTION_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToIpRestrictionDto(
  items: Record<string, unknown>,
): IpRestrictionSettingsDto {
  const raw = ((items && items[IP_RESTRICTION_KEY]) || {}) as Record<
    string,
    any
  >;
  const allowedIpsRaw = Array.isArray(raw.allowedIps)
    ? (raw.allowedIps as string[])
    : [];
  return {
    enabled: Boolean(raw.enabled),
    allowedIps: allowedIpsRaw,
  };
}
