/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Theme, ThemeVariablesResponse } from "./themeTypes";
import {
  fetchAvailableThemes,
  getTenantThemeVariables,
  selectTenantTheme,
  customizeTenantTheme,
} from "./themeApi";

interface ThemeError {
  response?: { data?: { message?: string } };
  message?: string;
}

interface ThemeContextValue {
  themes: Theme[];
  currentTheme: Theme | null;
  variables: ThemeVariablesResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  selectTheme: (themeId: string) => Promise<void>;
  updateCustomVariables: (
    customVars: Record<string, string>
  ) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function ThemeProviderComponent({ children }: { children: React.ReactNode }) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [variables, setVariables] = useState<ThemeVariablesResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const applyCssVariables = (vars: Record<string, string> | undefined | null) => {
    if (typeof document === "undefined" || !vars) return;
    const root = document.documentElement;
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      setError(null);

      const [themesRes, varsRes] = await Promise.all([
        fetchAvailableThemes(),
        getTenantThemeVariables(),
      ]);

      setThemes(themesRes);
      setVariables(varsRes);

      interface VarsWithThemeId extends ThemeVariablesResponse {
        themeId?: string;
      }
      const varsWithId = varsRes as VarsWithThemeId;
      const activeTheme =
        themesRes.find((t) => t._id === varsWithId.themeId) || null;
      setCurrentTheme(activeTheme || (themesRes[0] ?? null));

      applyCssVariables(varsRes.mergedCssVariables);
    } catch (err: unknown) {
      console.error("Error loading theme data", err);
      const error = err as ThemeError;
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load theme configuration."
      );
    } finally {
      setLoading(false);
    }
  };

  const memoizedLoadAll = React.useCallback(loadAll, []);

  useEffect(() => {
    void memoizedLoadAll();
  }, [memoizedLoadAll]);

  const handleSelectTheme = async (themeId: string) => {
    try {
      setLoading(true);
      setError(null);
      await selectTenantTheme(themeId);
      await memoizedLoadAll();
    } catch (err: unknown) {
      console.error("Error selecting theme", err);
      const error = err as ThemeError;
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to select theme."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCustomize = async (customVars: Record<string, string>) => {
    try {
      setLoading(true);
      setError(null);
      await customizeTenantTheme(customVars);
      await memoizedLoadAll();
    } catch (err: unknown) {
      console.error("Error customizing theme", err);
      const error = err as ThemeError;
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to customize theme."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectThemeMemo = React.useCallback(handleSelectTheme, [memoizedLoadAll]);
  const handleCustomizeMemo = React.useCallback(handleCustomize, [memoizedLoadAll]);

  const value: ThemeContextValue = useMemo(
    () => ({
      themes,
      currentTheme,
      variables,
      loading,
      error,
      refresh: memoizedLoadAll,
      selectTheme: handleSelectThemeMemo,
      updateCustomVariables: handleCustomizeMemo,
    }),
    [themes, currentTheme, variables, loading, error, memoizedLoadAll, handleSelectThemeMemo, handleCustomizeMemo]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const ThemeProvider = ThemeProviderComponent;

function useThemeContextHook(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Instead of throwing, return a fallback context with error state
    return {
      themes: [],
      currentTheme: null,
      variables: null,
      loading: false,
      error: 'Theme context unavailable. Please reload or contact support.',
      refresh: async () => {},
      selectTheme: async () => {},
      updateCustomVariables: async () => {},
    };
  }
  return ctx;
}

export const useThemeContext = useThemeContextHook;

/* eslint-enable react-refresh/only-export-components */
