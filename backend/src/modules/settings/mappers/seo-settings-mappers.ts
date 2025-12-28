import { SettingEntryDto } from '../dto/upsert-settings.dto';
import { SeoSettingsDto, UpdateSeoSettingsDto } from '../dto/seo-settings.dto';

export const SEO_KEY = 'seo.settings';

export function seoDtoToEntries(dto: UpdateSeoSettingsDto): SettingEntryDto[] {
  return [{ key: SEO_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToSeoDto(
  items: Record<string, unknown>,
): SeoSettingsDto {
  const raw = ((items && items[SEO_KEY]) || {}) as Record<string, unknown>;
  return {
    metaTitle: (raw.metaTitle as string) || '',
    metaTags: (Array.isArray(raw.metaTags) ? raw.metaTags : []) as string[],
    metaKeywords: (Array.isArray(raw.metaKeywords)
      ? raw.metaKeywords
      : []) as string[],
    metaDescription: (raw.metaDescription as string) || '',
    ogTitle: (raw.ogTitle as string) || '',
    ogDescription: (raw.ogDescription as string) || '',
    ogImage: (raw.ogImage as string) || '',
    canonicalType:
      typeof raw.canonicalType === 'string' ? raw.canonicalType : '',
  };
}
