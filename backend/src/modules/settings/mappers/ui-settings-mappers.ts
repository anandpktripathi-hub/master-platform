import { SettingEntryDto } from '../dto/upsert-settings.dto';
import {
  UpdateUiTogglesSettingsDto,
  UiTogglesSettingsDto,
} from '../dto/ui-toggles-settings.dto';
import {
  UpdateUiColorsLightSettingsDto,
  UiColorsLightSettingsDto,
} from '../dto/ui-colors-light-settings.dto';
import {
  UpdateUiColorsDarkSettingsDto,
  UiColorsDarkSettingsDto,
} from '../dto/ui-colors-dark-settings.dto';
import {
  UpdateUiColorsCategoriesSettingsDto,
  UiColorsCategoriesSettingsDto,
} from '../dto/ui-colors-categories-settings.dto';
import {
  UpdateUiTypographySettingsDto,
  UiTypographySettingsDto,
} from '../dto/ui-typography-settings.dto';

export const UI_TOGGLES_KEY = 'ui.toggles';
export const UI_COLORS_LIGHT_KEY = 'ui.colors.light';
export const UI_COLORS_DARK_KEY = 'ui.colors.dark';
export const UI_COLORS_CATEGORIES_KEY = 'ui.colors.categories';
export const UI_TYPOGRAPHY_KEY = 'ui.typography';

export function uiTogglesDtoToEntries(
  dto: UpdateUiTogglesSettingsDto,
): SettingEntryDto[] {
  return [{ key: UI_TOGGLES_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToUiTogglesDto(
  items: Record<string, unknown>,
): UiTogglesSettingsDto {
  const raw = ((items && items[UI_TOGGLES_KEY]) || {}) as Record<
    string,
    unknown
  >;
  return {
    darkModeAdmin: Boolean(raw.darkModeAdmin),
    stickyNavbar: Boolean(raw.stickyNavbar),
    adminNavSticky: Boolean(raw.adminNavSticky),
    maintenanceMode: Boolean(raw.maintenanceMode),
    mouseCursorEffect: Boolean(raw.mouseCursorEffect),
    sectionTitleExtraDesign: Boolean(raw.sectionTitleExtraDesign),
    languageSelectorVisible: Boolean(raw.languageSelectorVisible),
    backendPreloaderEnabled: Boolean(raw.backendPreloaderEnabled),
    paymentGatewayEnabled: Boolean(raw.paymentGatewayEnabled),
    forceSSLRedirect: Boolean(raw.forceSSLRedirect),
    requireEmailVerification: Boolean(raw.requireEmailVerification),
  };
}

export function uiColorsLightDtoToEntries(
  dto: UpdateUiColorsLightSettingsDto,
): SettingEntryDto[] {
  return [{ key: UI_COLORS_LIGHT_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToUiColorsLightDto(
  items: Record<string, unknown>,
): UiColorsLightSettingsDto {
  const raw = ((items && items[UI_COLORS_LIGHT_KEY]) || {}) as Record<
    string,
    unknown
  >;
  return {
    siteMainColor1: (raw.siteMainColor1 as string) || '',
    siteMainColor1Rgba: (raw.siteMainColor1Rgba as string) || undefined,
    siteMainColor2: (raw.siteMainColor2 as string) || '',
    siteMainColor3: (raw.siteMainColor3 as string) || '',
    headingColor: (raw.headingColor as string) || '',
    headingColorRgb: (raw.headingColorRgb as string) || undefined,
    paragraphColor1: (raw.paragraphColor1 as string) || '',
    paragraphColor2: (raw.paragraphColor2 as string) || '',
    paragraphColor3: (raw.paragraphColor3 as string) || '',
    paragraphColor4: (raw.paragraphColor4 as string) || '',
  };
}

export function uiColorsDarkDtoToEntries(
  dto: UpdateUiColorsDarkSettingsDto,
): SettingEntryDto[] {
  return [{ key: UI_COLORS_DARK_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToUiColorsDarkDto(
  items: Record<string, unknown>,
): UiColorsDarkSettingsDto {
  const raw = ((items && items[UI_COLORS_DARK_KEY]) || {}) as Record<
    string,
    unknown
  >;
  return {
    backgroundLightColor1: (raw.backgroundLightColor1 as string) || '',
    backgroundLightColor2: (raw.backgroundLightColor2 as string) || '',
    backgroundDarkColor1: (raw.backgroundDarkColor1 as string) || '',
    backgroundDarkColor2: (raw.backgroundDarkColor2 as string) || '',
    secondaryColor: (raw.secondaryColor as string) || '',
    baseColor2: (raw.baseColor2 as string) || '',
    mainColor5: (raw.mainColor5 as string) || '',
  };
}

export function uiColorsCategoriesDtoToEntries(
  dto: UpdateUiColorsCategoriesSettingsDto,
): SettingEntryDto[] {
  return [{ key: UI_COLORS_CATEGORIES_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToUiColorsCategoriesDto(
  items: Record<string, unknown>,
): UiColorsCategoriesSettingsDto {
  const raw = ((items && items[UI_COLORS_CATEGORIES_KEY]) || {}) as Record<
    string,
    unknown
  >;
  return {
    portfolioHomeColor: (raw.portfolioHomeColor as string) || '',
    logisticsHomeColor: (raw.logisticsHomeColor as string) || '',
    industryHomeColor: (raw.industryHomeColor as string) || '',
    constructionHomeColor: (raw.constructionHomeColor as string) || '',
    lawyerHomeColor: (raw.lawyerHomeColor as string) || '',
    politicalHomeColor: (raw.politicalHomeColor as string) || '',
    medicalHomeColor1: (raw.medicalHomeColor1 as string) || '',
    medicalHomeColor2: (raw.medicalHomeColor2 as string) || '',
    fruitsHomeColor: (raw.fruitsHomeColor as string) || '',
    fruitsHomeHeadingColor: (raw.fruitsHomeHeadingColor as string) || '',
    portfolioHomeDarkColor1: (raw.portfolioHomeDarkColor1 as string) || '',
    portfolioHomeDarkColor2: (raw.portfolioHomeDarkColor2 as string) || '',
    charityHomeColor: (raw.charityHomeColor as string) || '',
    designAgencyHomeColor: (raw.designAgencyHomeColor as string) || '',
    cleaningHomeColor: (raw.cleaningHomeColor as string) || '',
    cleaningHomeColor2: (raw.cleaningHomeColor2 as string) || '',
    courseHomeColor: (raw.courseHomeColor as string) || '',
    courseHomeColor2: (raw.courseHomeColor2 as string) || '',
    groceryHomeColor: (raw.groceryHomeColor as string) || '',
    groceryHomeColor2: (raw.groceryHomeColor2 as string) || '',
  };
}

export function uiTypographyDtoToEntries(
  dto: UpdateUiTypographySettingsDto,
): SettingEntryDto[] {
  return [{ key: UI_TYPOGRAPHY_KEY, scope: 'GLOBAL', value: dto }];
}

export function entriesToUiTypographyDto(
  items: Record<string, unknown>,
): UiTypographySettingsDto {
  const raw = ((items && items[UI_TYPOGRAPHY_KEY]) || {}) as Record<
    string,
    unknown
  >;
  return {
    useCustomFont: Boolean(raw.useCustomFont),
    bodyFontFamily: (raw.bodyFontFamily as string) || '',
    bodyFontVariants: Array.isArray(raw.bodyFontVariants)
      ? raw.bodyFontVariants
      : [],
    useHeadingFont: Boolean(raw.useHeadingFont),
    headingFontFamily: (raw.headingFontFamily as string) || '',
    headingFontVariants: Array.isArray(raw.headingFontVariants)
      ? raw.headingFontVariants
      : [],
  };
}
