import api from '../../services/api';

export const DomainHierarchyApi = {
  assignNodes: (domainId: string, nodeIds: string[]) => api.post(`/domain-hierarchy/${domainId}`, { nodeIds }),
  getNodes: (domainId: string) => api.get(`/domain-hierarchy/${domainId}`),
  removeAssignment: (domainId: string) => api.delete(`/domain-hierarchy/${domainId}`),
};
