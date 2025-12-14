import { Role } from '../enums/role.enum';
import { Permission } from '../enums/permission.enum';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.PLATFORM_SUPER_ADMIN]: Object.values(Permission) as Permission[],
  [Role.TENANT_OWNER]: [
    Permission.MANAGE_TENANT_USERS,
    Permission.MANAGE_TENANT_WEBSITE,
    Permission.MANAGE_TENANT_PRODUCTS,
    Permission.MANAGE_TENANT_ORDERS,
    Permission.MANAGE_TENANT_CUSTOMERS,
    Permission.MANAGE_TENANT_BILLING,
    Permission.SELECT_TENANT_THEME,
    Permission.VIEW_TENANT_ANALYTICS,
  ],
  [Role.TENANT_STAFF]: [
    Permission.MANAGE_TENANT_PRODUCTS,
    Permission.MANAGE_TENANT_ORDERS,
    Permission.MANAGE_TENANT_CUSTOMERS,
    Permission.VIEW_TENANT_ANALYTICS,
  ],
  [Role.CUSTOMER]: [],
};

export default ROLE_PERMISSIONS;
