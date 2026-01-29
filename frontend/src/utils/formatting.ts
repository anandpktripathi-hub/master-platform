import type { SystemSettingsDto, CurrencySettingsDto } from '../lib/api';

export function formatDateWithSystemSettings(
  input: string | Date,
  system: SystemSettingsDto | null | undefined,
): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }

  const fmt = (system && system.dateFormat || '').toUpperCase().trim();

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());

  if (!fmt) {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  let separator = '/';
  for (const candidate of ['/', '-', '.', ' ']) {
    if (fmt.includes(candidate)) {
      separator = candidate;
      break;
    }
  }

  if (fmt.startsWith('DD')) {
    return [day, month, year].join(separator);
  }
  if (fmt.startsWith('MM')) {
    return [month, day, year].join(separator);
  }
  if (fmt.startsWith('YYYY')) {
    const parts = fmt.split(separator);
    if (parts[1] && parts[1].startsWith('MM')) {
      return [year, month, day].join(separator);
    }
    return [year, day, month].join(separator);
  }

  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatCurrencyWithSettings(
  amountInCents: number,
  invoiceCurrency: string | null | undefined,
  currencySettings: CurrencySettingsDto | null | undefined,
): string {
  const fallback = (code: string) => {
    const major = (amountInCents || 0) / 100;
    return `${code.toUpperCase()} ${major.toFixed(2)}`;
  };

  const settings = currencySettings || null;
  const rawCode = invoiceCurrency || settings?.defaultCurrencyCode || 'USD';
  const code = rawCode.toUpperCase();

  if (!settings) {
    if (code === 'INR') {
      const major = (amountInCents || 0) / 100;
      return `₹${major.toFixed(2)}`;
    }
    return fallback(code);
  }

  const decimalFormat = settings.decimalFormat || '';
  let fractionDigits = 2;
  const match = decimalFormat.match(/0[.,](0+)/);
  if (match) {
    fractionDigits = match[1].length;
  }

  const decimalSep = settings.decimalSeparator === 'comma' ? ',' : '.';

  let thousandSep: string;
  switch (settings.thousandSeparator) {
    case 'comma':
      thousandSep = ',';
      break;
    case 'space':
      thousandSep = ' ';
      break;
    case 'none':
      thousandSep = '';
      break;
    case 'dot':
    default:
      thousandSep = '.';
      break;
  }

  const amountMajor = (amountInCents || 0) / 100;
  const abs = Math.abs(amountMajor);
  const sign = amountMajor < 0 ? '-' : '';

  const base = abs.toFixed(fractionDigits);
  const [intRaw, frac] = base.split('.');
  const useIndianGrouping = code === 'INR';

  const intWithSep = thousandSep
    ? formatIntegerWithGrouping(intRaw, thousandSep, useIndianGrouping)
    : intRaw;

  const numeric = frac ? `${intWithSep}${decimalSep}${frac}` : intWithSep;

  let symbol: string;
  if (settings.currencySymbolMode === 'symbol') {
    const map: Record<string, string> = {
      USD: '$',
      EUR: '€',
      INR: '₹',
      GBP: '£',
      AUD: 'A$',
      CAD: 'C$',
      JPY: '¥',
    };
    symbol = map[code] || code;
  } else {
    symbol = code;
  }

  const space = settings.currencySymbolSpace === 'with' ? ' ' : '';

  if (settings.currencySymbolPosition === 'post') {
    return `${sign}${numeric}${space}${symbol}`;
  }

  return `${sign}${symbol}${space}${numeric}`;
}

function formatIntegerWithGrouping(
  intRaw: string,
  thousandSep: string,
  useIndianGrouping: boolean,
): string {
  if (!thousandSep) {
    return intRaw;
  }

  if (!useIndianGrouping) {
    return intRaw.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSep);
  }

  if (intRaw.length <= 3) {
    return intRaw;
  }

  const last3 = intRaw.slice(-3);
  let rest = intRaw.slice(0, -3);
  const parts: string[] = [];

  while (rest.length > 2) {
    parts.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }

  if (rest) {
    parts.unshift(rest);
  }

  return `${parts.join(thousandSep)}${thousandSep}${last3}`;
}
