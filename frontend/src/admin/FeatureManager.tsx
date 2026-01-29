
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FeatureManager.css';
import FeatureForm from './FeatureForm';
import EditFeatureForm from './EditFeatureForm';
import AssignmentForm from './AssignmentForm';

export interface FeatureNode {
  id: string;
  name: string;
  type: 'module' | 'submodule' | 'feature' | 'subfeature' | 'option' | 'suboption' | 'point' | 'subpoint';
  enabled: boolean;
  children?: FeatureNode[];
  description?: string;
}


const FeatureManager: React.FC = () => {
  const [features, setFeatures] = useState<FeatureNode[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formParentId, setFormParentId] = useState<string | undefined>(undefined);
  const [editNode, setEditNode] = useState<FeatureNode | null>(null);


  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/features');
      setFeatures(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to load features');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeatures();
  }, []);


  const toggleFeature = async (id: string) => {
    await axios.patch(`/api/features/${id}/toggle`);
    fetchFeatures();
  };

  // Recursive tree rendering
  const handleAddChild = (parentId: string) => {
    setFormParentId(parentId);
    setShowForm(true);
  };

  const handleEdit = (node: FeatureNode) => {
    setEditNode(node);
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`/api/features/${id}`);
    setEditNode(null);
    fetchFeatures();
  };

  const handleEditSubmit = async (update: Partial<FeatureNode>) => {
    if (editNode) {
      await axios.patch(`/api/features/${editNode.id}`, update);
      setEditNode(null);
      fetchFeatures();
    }
  };

  const handleEditCancel = () => {
    setEditNode(null);
  };

  const handleAssignRole = async (id: string, role: string) => {
    await axios.patch(`/api/features/${id}/assign-role/${role}`);
    fetchFeatures();
  };
  const handleUnassignRole = async (id: string, role: string) => {
    await axios.patch(`/api/features/${id}/unassign-role/${role}`);
    fetchFeatures();
  };
  const handleAssignTenant = async (id: string, tenant: string) => {
    await axios.patch(`/api/features/${id}/assign-tenant/${tenant}`);
    fetchFeatures();
  };
  const handleUnassignTenant = async (id: string, tenant: string) => {
    await axios.patch(`/api/features/${id}/unassign-tenant/${tenant}`);
    fetchFeatures();
  };

  const renderTree = (nodes: FeatureNode[]) => (
    <ul>
      {nodes
        .filter(node =>
          node.name.toLowerCase().includes(filter.toLowerCase()) ||
          node.type.toLowerCase().includes(filter.toLowerCase())
        )
        .map((node) => (
        <li key={node.id}>
          <span>
            <strong>{node.name}</strong> ({node.type})
            <button className="toggle-btn" onClick={() => toggleFeature(node.id)}>
              {node.enabled ? 'Disable' : 'Enable'}
            </button>
            <button className="add-btn" onClick={() => handleAddChild(node.id)}>
              + Add Child
            </button>
            <button className="edit-btn" onClick={() => handleEdit(node)}>
              Edit
            </button>
          </span>
          <AssignmentForm
            node={node}
            onAssignRole={role => handleAssignRole(node.id, role)}
            onUnassignRole={role => handleUnassignRole(node.id, role)}
            onAssignTenant={tenant => handleAssignTenant(node.id, tenant)}
            onUnassignTenant={tenant => handleUnassignTenant(node.id, tenant)}
          />
          {editNode && editNode.id === node.id ? (
            <EditFeatureForm
              node={node}
              onSubmit={handleEditSubmit}
              onCancel={handleEditCancel}
              onDelete={() => handleDelete(node.id)}
            />
          ) : null}
          {node.children && node.children.length > 0 && renderTree(node.children)}
        </li>
      ))}
    </ul>
  );


  const handleAddRoot = () => {
    setFormParentId(undefined);
    setShowForm(true);
  };

  const handleFormSubmit = async (node: Omit<FeatureNode, 'children'>) => {
    await axios.post('/api/features', node, {
      params: formParentId ? { parentId: formParentId } : {},
    });
    setShowForm(false);
    setFormParentId(undefined);
    fetchFeatures();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setFormParentId(undefined);
  };

  return (
    <div className="feature-manager-container">
      <h2>Feature/Module Manager</h2>
      <input
        type="text"
        placeholder="Search by name or type"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="feature-manager-filter-input"
      />
      <button className="add-btn" onClick={handleAddRoot}>+ Add Root Module/Feature</button>
      {showForm && (
        <FeatureForm
          parentId={formParentId}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && renderTree(features)}
    </div>
  );
};

export default FeatureManager;
