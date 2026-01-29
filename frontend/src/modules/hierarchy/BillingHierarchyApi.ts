import api from '../../services/api';

export const BillingHierarchyApi = {
  assignNodes: (billingId: string, nodeIds: string[]) => api.post(`/billing-hierarchy/${billingId}`, { nodeIds }),
  getNodes: (billingId: string) => api.get(`/billing-hierarchy/${billingId}`),
  removeAssignment: (billingId: string) => api.delete(`/billing-hierarchy/${billingId}`),
};
