import { SettingEntryDto } from '../dto/upsert-settings.dto';
import {
  CurrencySettingsDto,
  UpdateCurrencySettingsDto,
} from '../dto/currency-settings.dto';

export const CURRENCY_KEY = 'currency.settings';

export function currencyDtoToEntries(
  dto: UpdateCurrencySettingsDto,
): SettingEntryDto[] {
  return [{ key: CURRENCY_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToCurrencyDto(
  items: Record<string, unknown>,
): CurrencySettingsDto {
  const raw = ((items && items[CURRENCY_KEY]) || {}) as Record<string, unknown>;
  return {
    decimalFormat: (raw.decimalFormat as string) || '',
    defaultCurrencyCode: (raw.defaultCurrencyCode as string) || '',
    decimalSeparator: (raw.decimalSeparator as 'dot' | 'comma') || 'dot',
    thousandSeparator:
      (raw.thousandSeparator as 'dot' | 'comma' | 'space' | 'none') || 'dot',
    floatNumberFormat: (raw.floatNumberFormat as 'dot' | 'comma') || 'dot',
    currencySymbolSpace:
      (raw.currencySymbolSpace as 'with' | 'without') || 'with',
    currencySymbolPosition:
      (raw.currencySymbolPosition as 'pre' | 'post') || 'pre',
    currencySymbolMode:
      (raw.currencySymbolMode as 'symbol' | 'name') || 'symbol',
  };
}
