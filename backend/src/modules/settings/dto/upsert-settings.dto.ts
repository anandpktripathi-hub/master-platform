export type SettingScope = 'GLOBAL' | 'TENANT';

export interface SettingEntryDto {
  key: string;
  scope: SettingScope;
  value: any;
  tenantId?: string;
  locale?: string;
  isActive?: boolean;
}
