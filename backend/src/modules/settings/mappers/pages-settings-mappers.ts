import { SettingEntryDto } from '../dto/upsert-settings.dto';
import {
  PagesSettingsDto,
  UpdatePagesSettingsDto,
} from '../dto/pages-settings.dto';

export const PAGES_KEY = 'pages.settings';

export function pagesDtoToEntries(
  dto: UpdatePagesSettingsDto,
): SettingEntryDto[] {
  return [{ key: PAGES_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToPagesDto(
  items: Record<string, unknown>,
): PagesSettingsDto {
  const raw = ((items && items[PAGES_KEY]) || {}) as Record<string, unknown>;
  return {
    homePageId: typeof raw.homePageId === 'string' ? raw.homePageId : null,
    pricingPageId:
      typeof raw.pricingPageId === 'string' ? raw.pricingPageId : null,
    enableLandingPage: Boolean(raw.enableLandingPage),
    enableSignup: Boolean(raw.enableSignup),
    enableRTL: Boolean(raw.enableRTL),
    layoutDark: Boolean(raw.layoutDark),
    sidebarTransparent: Boolean(raw.sidebarTransparent),
    categoryWiseSidemenu: Boolean(raw.categoryWiseSidemenu),
  };
}
