import { SettingEntryDto } from '../dto/upsert-settings.dto';
import {
  BrandingSettingsDto,
  UpdateBrandingSettingsDto,
} from '../dto/branding-settings.dto';

export const BRANDING_KEY = 'branding.settings';

export function brandingDtoToEntries(
  dto: UpdateBrandingSettingsDto,
): SettingEntryDto[] {
  return [{ key: BRANDING_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToBrandingDto(
  items: Record<string, unknown>,
): BrandingSettingsDto {
  const raw = ((items && items[BRANDING_KEY]) || {}) as Record<string, unknown>;
  return {
    siteLogo: (raw.siteLogo as string) || '',
    siteWhiteLogo: (raw.siteWhiteLogo as string) || '',
    favicon: (raw.favicon as string) || '',
    logoDark: (raw.logoDark as string) || '',
    logoLight: (raw.logoLight as string) || '',
    brandFavicon: (raw.brandFavicon as string) || '',
    titleText: (raw.titleText as string) || '',
    footerText: (raw.footerText as string) || '',
    breadcrumbImageLeft: (raw.breadcrumbImageLeft as string) || '',
    breadcrumbImageRight: (raw.breadcrumbImageRight as string) || '',
    mainHeroImage: (raw.mainHeroImage as string) || '',
  };
}
