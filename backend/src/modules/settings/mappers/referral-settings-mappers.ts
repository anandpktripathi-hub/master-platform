import { SettingEntryDto } from '../dto/upsert-settings.dto';
import {
  ReferralSettingsDto,
  UpdateReferralSettingsDto,
} from '../dto/referral-settings.dto';

export const REFERRAL_KEY = 'referral.settings';

export function referralDtoToEntries(
  dto: UpdateReferralSettingsDto,
): SettingEntryDto[] {
  return [{ key: REFERRAL_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToReferralDto(
  items: Record<string, unknown>,
): ReferralSettingsDto {
  const raw = ((items && items[REFERRAL_KEY]) || {}) as Record<string, unknown>;
  return {
    enabled: Boolean(raw.enabled),
    commissionPercent: Number(raw.commissionPercent) || 0,
    minimumThresholdAmount: Number(raw.minimumThresholdAmount) || 0,
    guidelines: (raw.guidelines as string) || '',
  };
}
