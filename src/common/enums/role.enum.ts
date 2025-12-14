export enum Role {
  PLATFORM_SUPER_ADMIN = 'PLATFORM_SUPER_ADMIN',
  TENANT_OWNER = 'TENANT_OWNER',
  TENANT_STAFF = 'TENANT_STAFF',
  CUSTOMER = 'CUSTOMER',
}

export type RoleType = keyof typeof Role | Role;
