import api from '../../services/api';

export const UserHierarchyApi = {
  assignNodes: (userId: string, nodeIds: string[]) => api.post(`/user-hierarchy/${userId}`, { nodeIds }),
  getNodes: (userId: string) => api.get(`/user-hierarchy/${userId}`),
  removeAssignment: (userId: string) => api.delete(`/user-hierarchy/${userId}`),
};
