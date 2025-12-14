/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getCurrentTheme } from '../services/themeApi';
import type { TenantThemeResponse } from '../services/themeApi';

interface ThemeContextValue {
  tenantTheme: TenantThemeResponse | null;
  loading: boolean;
  error: string | null;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

interface ThemeError {
  response?: { data?: { message?: string } };
}

/**
 * ThemeProvider
 * 
 * Fetches tenant's current theme from backend and provides it to MUI ThemeProvider.
 * Automatically converts backend theme data to MUI theme object.
 * 
 * Usage:
 * - Wrap your app with <ThemeProvider> at the root level
 * - Call refreshTheme() after selecting/customizing theme
 * - Access theme data via useTheme() hook
 */
function ThemeProviderComponent({ children }: ThemeProviderProps) {
  const [tenantTheme, setTenantTheme] = useState<TenantThemeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTheme = async () => {
    try {
      setLoading(true);
      setError(null);
      const theme = await getCurrentTheme();
      setTenantTheme(theme);
    } catch (err: unknown) {
      console.error('Failed to fetch tenant theme:', err);
      const error = err as ThemeError;
      setError(error?.response?.data?.message || 'Failed to load theme');
      // Use default theme on error
      setTenantTheme(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTheme();
  }, []);

  const refreshTheme = async () => {
    await fetchTheme();
  };

  // Convert tenant theme to MUI theme
  const muiTheme = createMuiTheme(tenantTheme);

  return (
    <ThemeContext.Provider value={{ tenantTheme, loading, error, refreshTheme }}>
      <MUIThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
}

export const ThemeProvider = ThemeProviderComponent;

/**
 * Hook to access theme context
 */
function useThemeHook(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export const useTheme = useThemeHook;

/* eslint-enable react-refresh/only-export-components */

/**
 * Convert backend tenant theme to MUI theme object
 */
function createMuiTheme(tenantTheme: TenantThemeResponse | null): Theme {
  // Default theme values
  const defaultColors = {
    primary: '#1976d2',
    secondary: '#dc004e',
    background: '#ffffff',
    surface: '#f5f5f5',
    textPrimary: '#000000',
    textSecondary: '#666666',
  };

  const defaultTypography = {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
  };

  const defaultSpacing = {
    base: 8,
    borderRadius: 4,
  };

  // If no tenant theme, use defaults
  if (!tenantTheme) {
    return createTheme({
      palette: {
        primary: { main: defaultColors.primary },
        secondary: { main: defaultColors.secondary },
        background: {
          default: defaultColors.background,
          paper: defaultColors.surface,
        },
        text: {
          primary: defaultColors.textPrimary,
          secondary: defaultColors.textSecondary,
        },
      },
      typography: {
        fontFamily: defaultTypography.fontFamily,
        fontSize: defaultTypography.fontSize,
      },
      spacing: defaultSpacing.base,
      shape: {
        borderRadius: defaultSpacing.borderRadius,
      },
    });
  }

  // Merge base theme with customizations
  const colors = {
    primary: tenantTheme.customizations.primaryColor || tenantTheme.primaryColor,
    secondary: tenantTheme.customizations.secondaryColor || tenantTheme.secondaryColor,
    background: tenantTheme.customizations.backgroundColor || tenantTheme.backgroundColor,
    surface: tenantTheme.customizations.surfaceColor || tenantTheme.surfaceColor,
    textPrimary: tenantTheme.customizations.textPrimaryColor || tenantTheme.textPrimaryColor,
    textSecondary: tenantTheme.customizations.textSecondaryColor || tenantTheme.textSecondaryColor,
  };

  const typography = {
    fontFamily: tenantTheme.customizations.fontFamily || tenantTheme.fontFamily,
    fontSize: tenantTheme.customizations.baseFontSize || tenantTheme.baseFontSize,
  };

  const spacing = {
    base: tenantTheme.customizations.baseSpacing || tenantTheme.baseSpacing,
    borderRadius: tenantTheme.customizations.borderRadius || tenantTheme.borderRadius,
  };

  return createTheme({
    palette: {
      primary: { main: colors.primary },
      secondary: { main: colors.secondary },
      background: {
        default: colors.background,
        paper: colors.surface,
      },
      text: {
        primary: colors.textPrimary,
        secondary: colors.textSecondary,
      },
    },
    typography: {
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
    },
    spacing: spacing.base,
    shape: {
      borderRadius: spacing.borderRadius,
    },
  });
}
