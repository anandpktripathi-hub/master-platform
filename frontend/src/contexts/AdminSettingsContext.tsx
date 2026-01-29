import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  settingsApi,
} from '../lib/api';
import type {
  BasicSettingsDto,
  BrandingSettingsDto,
  UiColorsLightSettingsDto,
  UiTogglesSettingsDto,
  UiTypographySettingsDto,
  SystemSettingsDto,
  CurrencySettingsDto,
} from '../lib/api';

type AdminSettingsContextValue = {
  basic: BasicSettingsDto | null;
  branding: BrandingSettingsDto | null;
  uiToggles: UiTogglesSettingsDto | null;
  uiColorsLight: UiColorsLightSettingsDto | null;
  uiTypography: UiTypographySettingsDto | null;
  system: SystemSettingsDto | null;
  currency: CurrencySettingsDto | null;
  loading: boolean;
  error: string | null;
  dismissError: () => void;
};

const AdminSettingsContext = createContext<AdminSettingsContextValue | undefined>(undefined);

export function AdminSettingsProvider({ children }: { children: React.ReactNode }) {
  const [basic, setBasic] = useState<BasicSettingsDto | null>(null);
  const [branding, setBranding] = useState<BrandingSettingsDto | null>(null);
  const [uiToggles, setUiToggles] = useState<UiTogglesSettingsDto | null>(null);
  const [uiColorsLight, setUiColorsLight] = useState<UiColorsLightSettingsDto | null>(null);
  const [uiTypography, setUiTypography] = useState<UiTypographySettingsDto | null>(null);
    const [system, setSystem] = useState<SystemSettingsDto | null>(null);
    const [currency, setCurrency] = useState<CurrencySettingsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setError(null);
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          if (mounted) setLoading(false);
          return;
        }
        const [
          basicRes,
          brandingRes,
          uiToggleRes,
          uiColorLightRes,
          uiTypographyRes,
          systemRes,
          currencyRes,
        ] = await Promise.all([
          settingsApi.getBasicSettings(),
          settingsApi.getBrandingSettings(),
          settingsApi.getUiTogglesSettings(),
          settingsApi.getUiColorsLightSettings(),
          settingsApi.getUiTypographySettings(),
          settingsApi.getSystemSettings(),
          settingsApi.getCurrencySettings(),
        ]);
        if (!mounted) return;
        setBasic(basicRes);
        setBranding(brandingRes);
        setUiToggles(uiToggleRes);
        setUiColorsLight(uiColorLightRes);
        setUiTypography(uiTypographyRes);
        setSystem(systemRes);
        setCurrency(currencyRes);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load admin settings');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    applyDocumentTitle(basic, branding);
  }, [basic, branding]);

  useEffect(() => {
    applyAdminTheme(uiToggles, uiColorsLight, uiTypography);
  }, [uiToggles, uiColorsLight, uiTypography]);

  const dismissError = () => setError(null);

  const value = useMemo<AdminSettingsContextValue>(() => ({
    basic,
    branding,
    uiToggles,
    uiColorsLight,
    uiTypography,
    system,
    currency,
    loading,
    error,
    dismissError,
  }), [basic, branding, uiToggles, uiColorsLight, uiTypography, system, currency, loading, error]);

  return <AdminSettingsContext.Provider value={value}>{children}</AdminSettingsContext.Provider>;
}

export function useAdminSettings() {
  const ctx = useContext(AdminSettingsContext);
  if (!ctx) {
    // Fallback context when provider is unavailable
    return {
      basic: null,
      branding: null,
      uiToggles: null,
      uiColorsLight: null,
      uiTypography: null,
      system: null,
      currency: null,
      loading: false,
      error: 'Admin settings context unavailable. Please reload or contact support.',
      dismissError: () => {},
    } as AdminSettingsContextValue;
  }
  return ctx;
}

function applyDocumentTitle(basic: BasicSettingsDto | null, branding: BrandingSettingsDto | null) {
  const nextTitle = branding?.titleText || basic?.siteTitle;
  if (nextTitle) {
    document.title = nextTitle;
  }
}

function applyAdminTheme(
  uiToggles: UiTogglesSettingsDto | null,
  uiColorsLight: UiColorsLightSettingsDto | null,
  uiTypography: UiTypographySettingsDto | null,
) {
  const root = document.documentElement;
  const isDark = uiToggles?.darkModeAdmin ?? true;

  root.dataset.adminTheme = isDark ? 'dark' : 'light';

  const primary = uiColorsLight?.siteMainColor1 ?? '#0ea5e9';
  const primaryAlt = uiColorsLight?.siteMainColor2 ?? '#22c55e';
  const surface = isDark ? '#111827' : '#ffffff';

  root.style.setProperty('--admin-color-main-1', primary);
  root.style.setProperty('--admin-color-main-2', uiColorsLight?.siteMainColor2 ?? '#22c55e');
  root.style.setProperty('--admin-color-main-3', uiColorsLight?.siteMainColor3 ?? '#6366f1');
  root.style.setProperty('--admin-heading-color', uiColorsLight?.headingColor ?? '#e2e8f0');

  root.style.setProperty('--admin-font-body', uiTypography?.bodyFontFamily ?? 'Inter, system-ui, sans-serif');
  root.style.setProperty('--admin-font-heading', uiTypography?.headingFontFamily ?? 'Inter, system-ui, sans-serif');

  root.style.setProperty('--admin-bg', isDark ? '#0f172a' : '#ffffff');
  root.style.setProperty('--admin-surface', surface);
  root.style.setProperty('--admin-text', isDark ? '#e2e8f0' : '#0f172a');
  root.style.setProperty('--admin-text-muted', isDark ? '#cbd5e1' : '#475569');
  root.style.setProperty('--admin-border', isDark ? '#1f2937' : '#e2e8f0');
  root.style.setProperty('--admin-sidebar-bg', isDark ? '#0b1224' : '#ffffff');
  root.style.setProperty('--admin-sidebar-active', isDark ? '#1f2937' : '#e2e8f0');
  root.style.setProperty('--admin-nav-bg', isDark ? '#0b1224' : '#ffffff');
  root.style.setProperty('--admin-nav-text', isDark ? '#e2e8f0' : '#0f172a');
  root.style.setProperty('--admin-primary', primary);
  root.style.setProperty('--admin-primary-hover', primaryAlt);
}