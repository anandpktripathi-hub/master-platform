// Status enum aligned with backend TenantStatus
// See: src/modules/tenants/schemas/tenant.schema.ts
export const TenantStatus = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  TRIAL: "TRIAL",
  CANCELLED: "CANCELLED",
} as const;

export type TenantStatus = typeof TenantStatus[keyof typeof TenantStatus];

// Plan enum as a runtime value + TS type
export const TenantPlan = {
  FREE: "FREE",
  BASIC: "BASIC",
  PRO: "PRO",
  ENTERPRISE: "ENTERPRISE",
} as const;

export type TenantPlan = typeof TenantPlan[keyof typeof TenantPlan];

export interface Tenant {
  // MongoDB identifier (from admin /tenants aggregate)
  _id?: string;
  id?: string;

  name: string;
  slug?: string;
  domain?: string;

  plan?: TenantPlan;
  status?: TenantStatus;

  ownerEmail?: string;

  // Usage / meta fields returned by admin tenants API
  userCount?: number;
  lastLoginAt?: string;
  maxUsers?: number;
  maxStorageMB?: number;
  notes?: string;

  createdAt?: string;
  updatedAt?: string;
}

// Dummy runtime export so bundlers have a real 'Tenant' value export.
export const Tenant = {} as Tenant;
