export type ThemeStatus = 'ACTIVE' | 'INACTIVE';

export interface Theme {
  _id: string;
  name: string;
  key: string;
  previewImage?: string;
  status: ThemeStatus;
  cssVariables?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantTheme {
  tenantId: string;
  themeId: string;
  customCssVariables?: Record<string, string>;
  mergedCssVariables?: Record<string, string>;
  updatedAt?: string;
}

export interface ThemeVariablesResponse {
  cssVariables: Record<string, string>;
  customCssVariables?: Record<string, string>;
  mergedCssVariables: Record<string, string>;
}
