export const TenantStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  TRIAL: "trial",
  SUSPENDED: "suspended",
} as const;

export type TenantStatus = typeof TenantStatus[keyof typeof TenantStatus];

// Plan enum as a runtime value + TS type
export const TenantPlan = {
  FREE: "FREE",
  PRO: "PRO",
  ENTERPRISE: "ENTERPRISE",
} as const;

export type TenantPlan = typeof TenantPlan[keyof typeof TenantPlan];

export interface Tenant {
  id: string;
  name: string;
  slug?: string;
  domain?: string;
  plan?: TenantPlan;
  status?: TenantStatus;
  ownerEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Dummy runtime export so bundlers have a real 'Tenant' value export.
export const Tenant = {} as Tenant;
