import api from '../../services/api';

export const PackageHierarchyApi = {
  assignNodes: (packageId: string, nodeIds: string[]) => api.post(`/package-hierarchy/${packageId}`, { nodeIds }),
  getNodes: (packageId: string) => api.get(`/package-hierarchy/${packageId}`),
  removeAssignment: (packageId: string) => api.delete(`/package-hierarchy/${packageId}`),
};
