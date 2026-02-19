import api from '../lib/api';

// ========== TYPE DEFINITIONS ==========

export interface ThemeColors {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textPrimaryColor: string;
  textSecondaryColor: string;
}

export interface ThemeTypography {
  fontFamily: string;
  baseFontSize: number;
}

export interface ThemeSpacing {
  baseSpacing: number;
  borderRadius: number;
}

export interface ThemeResponse {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isDefault: boolean;
  previewImageUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeWithColors extends ThemeResponse, ThemeColors, ThemeTypography, ThemeSpacing {}

export interface TenantThemeResponse extends ThemeResponse {
  tenantId: string;
  baseThemeId: string;
  customizations: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    surfaceColor?: string;
    textPrimaryColor?: string;
    textSecondaryColor?: string;
    fontFamily?: string;
    baseFontSize?: number;
    baseSpacing?: number;
    borderRadius?: number;
  };
  lastModifiedBy: string;
  appliedAt: string;
}

export interface CreateThemeDto {
  name: string;
  slug: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textPrimaryColor: string;
  textSecondaryColor: string;
  fontFamily: string;
  baseFontSize: number;
  baseSpacing: number;
  borderRadius: number;
  isActive?: boolean;
  previewImageUrl?: string;
  metadata?: Record<string, unknown>;
}

export type UpdateThemeDto = Partial<CreateThemeDto>;

export interface CustomizeThemeDto {
  customPrimaryColor?: string;
  customSecondaryColor?: string;
  customBackgroundColor?: string;
  customSurfaceColor?: string;
  customTextPrimaryColor?: string;
  customTextSecondaryColor?: string;
  customFontFamily?: string;
  customBaseFontSize?: number;
  customBaseSpacing?: number;
  customBorderRadius?: number;
}

// ========== ADMIN THEME API ==========

/**
 * Create a new theme (super admin only)
 */
export const createTheme = async (data: CreateThemeDto): Promise<ThemeResponse> => {
  return api.post(`/admin/themes`, data);
};

/**
 * Get all themes (super admin only)
 */
export const getAllThemes = async (): Promise<ThemeResponse[]> => {
  return api.get(`/admin/themes`);
};

/**
 * Get a theme by ID (super admin only)
 */
export const getThemeById = async (id: string): Promise<ThemeResponse> => {
  return api.get(`/admin/themes/${id}`);
};

/**
 * Update a theme (super admin only)
 */
export const updateTheme = async (id: string, data: UpdateThemeDto): Promise<ThemeResponse> => {
  return api.put(`/admin/themes/${id}`, data);
};

/**
 * Delete a theme (super admin only)
 */
export const deleteTheme = async (id: string): Promise<void> => {
  await api.delete(`/admin/themes/${id}`);
};

/**
 * Set a theme as default (super admin only)
 */
export const setDefaultTheme = async (id: string): Promise<ThemeResponse> => {
  return api.post(`/admin/themes/${id}/set-default`);
};

// ========== TENANT THEME API ==========

/**
 * Get available themes for tenant selection
 */
export const getAvailableThemes = async (): Promise<ThemeResponse[]> => {
  return api.get(`/tenant/themes/available`);
};

/**
 * Get current tenant theme (with customizations)
 */
export const getCurrentTheme = async (): Promise<TenantThemeResponse> => {
  return api.get(`/tenant/themes/current`);
};

/**
 * Select a theme for tenant
 */
export const selectTheme = async (baseThemeId: string): Promise<TenantThemeResponse> => {
  return api.post(`/tenant/themes/select`, { baseThemeId });
};

/**
 * Customize tenant theme
 */
export const customizeTheme = async (customizations: CustomizeThemeDto): Promise<TenantThemeResponse> => {
  return api.put(`/tenant/themes/customize`, customizations);
};

/**
 * Reset theme to base (remove customizations)
 */
export const resetTheme = async (): Promise<TenantThemeResponse> => {
  return api.post(`/tenant/themes/reset`);
};
