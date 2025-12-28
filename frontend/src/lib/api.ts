import type { LoginPayload } from '../contexts/AuthContext';
export interface BasicSettingsDto {
  siteTitle: string;
  siteTagLine: string;
  footerCopyright: string;
  siteLogo: string;
  siteWhiteLogo: string;
  siteFavicon: string;
}

export interface UpdateBasicSettingsDto extends BasicSettingsDto {}

export interface BrandingSettingsDto {
  siteLogo: string;
  siteWhiteLogo: string;
  favicon: string;
  logoDark: string;
  logoLight: string;
  brandFavicon: string;
  titleText: string;
  footerText: string;
  breadcrumbImageLeft: string;
  breadcrumbImageRight: string;
  mainHeroImage: string;
}

export type UpdateBrandingSettingsDto = BrandingSettingsDto;

export interface UiColorsLightSettingsDto {
// Ensure named export for BasicSettingsDto
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export interface UiColorsDarkSettingsDto {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export interface UiColorsCategoriesSettingsDto {
  [category: string]: {
    color: string;
    label: string;
  };
}

export interface UiTogglesSettingsDto {
  darkMode: boolean;
  compactMode: boolean;
  showSidebar: boolean;
}

export interface UiTypographySettingsDto {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
}
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: add Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: unwrap response.data and handle 401/403
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(new Error("Session expired. Please login again."));
      }
      if (error.response.status === 403) {
        return Promise.reject(new Error("Permission denied"));
      }
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);


export const authApi = {
  login: (payload: LoginPayload) => api.post("/auth/login", payload),
  logout: () => api.post("/auth/logout"),
  register: (payload: any) => api.post("/auth/register", payload),
  refreshToken: () => api.post("/auth/refresh"),
};

export const settingsApi = {
  // Basic Settings
  getBasicSettings: () => api.get('/settings/basic'),
  updateBasicSettings: (data: BasicSettingsDto) => api.put('/settings/basic', data),

  // Branding Settings
  getBrandingSettings: () => api.get('/settings/branding'),
  updateBrandingSettings: (data: BrandingSettingsDto) => api.put('/settings/branding', data),

  // UI Color Settings (Light)
  getUiColorsLightSettings: () => api.get('/settings/ui/colors/light'),
  updateUiColorsLightSettings: (data: UiColorsLightSettingsDto) => api.put('/settings/ui/colors/light', data),

  // UI Color Settings (Dark)
  getUiColorsDarkSettings: () => api.get('/settings/ui/colors/dark'),
  updateUiColorsDarkSettings: (data: UiColorsDarkSettingsDto) => api.put('/settings/ui/colors/dark', data),

  // UI Color Settings (Categories)
  getUiColorsCategoriesSettings: () => api.get('/settings/ui/colors/categories'),
  updateUiColorsCategoriesSettings: (data: UiColorsCategoriesSettingsDto) => api.put('/settings/ui/colors/categories', data),

  // UI Toggle Settings
  getUiTogglesSettings: () => api.get('/settings/ui/toggles'),
  updateUiTogglesSettings: (data: UiTogglesSettingsDto) => api.put('/settings/ui/toggles', data),

  // UI Typography Settings
  getUiTypographySettings: () => api.get('/settings/ui/typography'),
  updateUiTypographySettings: (data: UiTypographySettingsDto) => api.put('/settings/ui/typography', data),
};

export const dashboardsApi = api;

export default api;

// (Removed duplicate export type block)
// All duplicate declarations and exports have been removed from this file.