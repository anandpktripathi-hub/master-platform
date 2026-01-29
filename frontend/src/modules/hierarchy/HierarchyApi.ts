import api from '../../services/api';

export interface HierarchyNode {
  _id?: string;
  name: string;
  type: 'module' | 'submodule' | 'feature' | 'subfeature' | 'option' | 'suboption' | 'point' | 'subpoint';
  parent?: string | null;
  children?: string[];
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const HierarchyApi = {
  create: (data: Partial<HierarchyNode>) => api.post('/hierarchy', data),
  get: (id: string) => api.get(`/hierarchy/${id}`),
  getChildren: (id: string) => api.get(`/hierarchy/${id}/children`),
  update: (id: string, data: Partial<HierarchyNode>) => api.patch(`/hierarchy/${id}`, data),
  delete: (id: string) => api.delete(`/hierarchy/${id}`),
  getTree: (rootType: string = 'module') => api.get(`/hierarchy?rootType=${rootType}`),
};

export default HierarchyApi;
