export interface CmsPageEntity {
  tenantId: string;
  slug: string;
  title: string;
}
export interface CmsPageVersionEntity {
  pageId: string;
  version: string;
  content: string;
}
export interface CmsPageTemplateEntity {
  name: string;
  template: string;
}
export interface CmsPageAnalyticsEntity {
  pageId: string;
  views: number;
}
export interface CmsSeoAuditEntity {
  auditId: string;
  pageId: string;
  score: number;
}
export interface CmsMenuItemEntity {
  label: string;
  url: string;
}
export interface CmsImportRecord {
  id: number;
  fileName: string;
  status: string;
}

export enum PageStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum PageVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum ImportStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum ImportType {
  PAGES = 'PAGES',
  MENUS = 'MENUS',
}

export enum SeoAuditStatus {
  PASS = 'PASS',
  WARN = 'WARN',
  FAIL = 'FAIL',
}
