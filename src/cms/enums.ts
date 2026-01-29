export enum PageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  SCHEDULED = 'scheduled',
}

export enum PageVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PASSWORD_PROTECTED = 'password_protected',
  RESTRICTED = 'restricted',
}

export enum ImportType {
  ZIP = 'zip',
  CSV = 'csv',
  JSON = 'json',
  EXCEL = 'excel',
}

export enum ImportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum SeoAuditStatus {
  PASS = 'pass',
  WARN = 'warn',
  FAIL = 'fail',
}

export enum DomainStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}
