import api from '../../services/api';

export const RoleHierarchyApi = {
  assignNodes: (roleName: string, nodeIds: string[]) => api.post(`/role-hierarchy/${roleName}`, { nodeIds }),
  getNodes: (roleName: string) => api.get(`/role-hierarchy/${roleName}`),
  removeAssignment: (roleName: string) => api.delete(`/role-hierarchy/${roleName}`),
};
