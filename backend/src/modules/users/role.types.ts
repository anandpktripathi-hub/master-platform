// Central Role type for the user domain
export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  OWNER = 'owner',
  PLATFORM_SUPER_ADMIN = 'PLATFORM_SUPER_ADMIN',
  // Legacy/aliases retained for compatibility (schema enum)
  PLATFORM_ADMIN_LEGACY = 'platform_admin',
  TENANT_ADMIN_LEGACY = 'tenant_admin',
  STAFF_LEGACY = 'staff',
  CUSTOMER_LEGACY = 'customer',
}

export type RoleUnion =
  | Role.USER
  | Role.ADMIN
  | Role.OWNER
  | Role.PLATFORM_SUPER_ADMIN
  | Role.PLATFORM_ADMIN_LEGACY
  | Role.TENANT_ADMIN_LEGACY
  | Role.STAFF_LEGACY
  | Role.CUSTOMER_LEGACY;
