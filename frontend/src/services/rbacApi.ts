import api from './api';

export interface Permission {
  _id: string;
  action: 'manage' | 'create' | 'edit' | 'delete' | 'show';
  module: string;
  description?: string;
}
export interface Role {
  _id: string;
  name: string;
  description?: string;
  tenantId?: string;
  isSystem?: boolean;
  permissions: Permission[];
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export interface UserTenant {
  _id: string;
  userId: string;
  user?: User;
  tenantId: string;
  roleId: string;
  role?: Role;
  isLoginEnabled: boolean;
  status: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  _id: string;
  name: string;
  description?: string;
  tenantId?: string;
  isSystem?: boolean;
  permissions: Permission[];
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// RBAC API METHODS
// ============================================================================

const rbacApi = {
  // Permissions
  getAllPermissions: () => api.get('/rbac/permissions'),
  getPermissionsByModule: (module: string) => api.get(`/rbac/permissions/module/${module}`),
  createPermission: (data: Permission) => api.post('/rbac/permissions', data),

  // Roles
  createRole: (data: Role) => api.post('/rbac/roles', data),
  getRoles: () => api.get('/rbac/roles'),
  getRole: (roleId: string) => api.get(`/rbac/roles/${roleId}`),
  updateRole: (roleId: string, data: Role) => api.put(`/rbac/roles/${roleId}`, data),
  deleteRole: (roleId: string) => api.delete(`/rbac/roles/${roleId}`),

  // Users
  createUser: (data: UserTenant) => api.post('/rbac/users', data),
  getUsers: (page: number = 1, limit: number = 10) =>
    api.get('/rbac/users', { params: { page, limit } }),
  updateUser: (userTenantId: string, data: UserTenant) =>
    api.put(`/rbac/users/${userTenantId}`, data),
  deleteUser: (userTenantId: string) => api.delete(`/rbac/users/${userTenantId}`),
  resetPassword: (userTenantId: string, newPassword: string) =>
    api.post(`/rbac/users/${userTenantId}/reset-password`, { newPassword }),
  toggleLogin: (userTenantId: string, enable: boolean) =>
    api.post(`/rbac/users/${userTenantId}/toggle-login`, { enable }),
};

export default rbacApi;
