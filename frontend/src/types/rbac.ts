export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum Permission {
  MANAGE_PLANS = "MANAGE_PLANS",
  VIEW_BILLING = "VIEW_BILLING",
  VIEW_INVOICES = "VIEW_INVOICES",
  MANAGE_THEME = "MANAGE_THEME",
}

/**
 * Convenience maps so the rest of the app can use
 * ROLES.SUPER_ADMIN and PERMISSIONS.MANAGE_PLANS, etc.
 */
export const ROLES = {
  SUPER_ADMIN: Role.SUPER_ADMIN,
  ADMIN: Role.ADMIN,
  USER: Role.USER,
};

export const PERMISSIONS = {
  MANAGE_PLANS: Permission.MANAGE_PLANS,
  VIEW_BILLING: Permission.VIEW_BILLING,
  VIEW_INVOICES: Permission.VIEW_INVOICES,
  MANAGE_THEME: Permission.MANAGE_THEME,
};

/**
 * ROLE_PERMISSIONS maps each role to the permissions it has.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: [
    Permission.MANAGE_PLANS,
    Permission.VIEW_BILLING,
    Permission.VIEW_INVOICES,
    Permission.MANAGE_THEME,
  ],
  [Role.ADMIN]: [
    Permission.MANAGE_PLANS,
    Permission.VIEW_BILLING,
    Permission.VIEW_INVOICES,
    Permission.MANAGE_THEME,
  ],
  [Role.USER]: [
    Permission.VIEW_BILLING,
    Permission.VIEW_INVOICES,
  ],
};
