import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
  const response = await axios.post(`${API_BASE_URL}/admin/themes`, data);
  return response.data;
};

/**
 * Get all themes (super admin only)
 */
export const getAllThemes = async (): Promise<ThemeResponse[]> => {
  const response = await axios.get(`${API_BASE_URL}/admin/themes`);
  return response.data;
};

/**
 * Get a theme by ID (super admin only)
 */
export const getThemeById = async (id: string): Promise<ThemeResponse> => {
  const response = await axios.get(`${API_BASE_URL}/admin/themes/${id}`);
  return response.data;
};

/**
 * Update a theme (super admin only)
 */
export const updateTheme = async (id: string, data: UpdateThemeDto): Promise<ThemeResponse> => {
  const response = await axios.put(`${API_BASE_URL}/admin/themes/${id}`, data);
  return response.data;
};

/**
 * Delete a theme (super admin only)
 */
export const deleteTheme = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/admin/themes/${id}`);
};

/**
 * Set a theme as default (super admin only)
 */
export const setDefaultTheme = async (id: string): Promise<ThemeResponse> => {
  const response = await axios.post(`${API_BASE_URL}/admin/themes/${id}/set-default`);
  return response.data;
};

// ========== TENANT THEME API ==========

/**
 * Get available themes for tenant selection
 */
export const getAvailableThemes = async (): Promise<ThemeResponse[]> => {
  const response = await axios.get(`${API_BASE_URL}/tenant/themes/available`);
  return response.data;
};

/**
 * Get current tenant theme (with customizations)
 */
export const getCurrentTheme = async (): Promise<TenantThemeResponse> => {
  const response = await axios.get(`${API_BASE_URL}/tenant/themes/current`);
  return response.data;
};

/**
 * Select a theme for tenant
 */
export const selectTheme = async (baseThemeId: string): Promise<TenantThemeResponse> => {
  const response = await axios.post(`${API_BASE_URL}/tenant/themes/select`, { baseThemeId });
  return response.data;
};

/**
 * Customize tenant theme
 */
export const customizeTheme = async (customizations: CustomizeThemeDto): Promise<TenantThemeResponse> => {
  const response = await axios.put(`${API_BASE_URL}/tenant/themes/customize`, customizations);
  return response.data;
};

/**
 * Reset theme to base (remove customizations)
 */
export const resetTheme = async (): Promise<TenantThemeResponse> => {
  const response = await axios.post(`${API_BASE_URL}/tenant/themes/reset`);
  return response.data;
};
