import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FeatureNode } from './FeatureManager';
import './PermissionsMatrix.css';

interface PermissionsMatrixProps {
  roles: string[];
  tenants: string[];
}

const PermissionsMatrix: React.FC<PermissionsMatrixProps> = ({ roles, tenants }) => {
  const [features, setFeatures] = useState<FeatureNode[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedTenant, setSelectedTenant] = useState<string>('');

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    const res = await axios.get('/api/features');
    setFeatures(res.data);
  };

  const handleToggleRole = async (featureId: string, role: string, assigned: boolean) => {
    if (assigned) {
      await axios.patch(`/api/features/${featureId}/unassign-role/${role}`);
    } else {
      await axios.patch(`/api/features/${featureId}/assign-role/${role}`);
    }
    fetchFeatures();
  };

  const handleToggleTenant = async (featureId: string, tenant: string, assigned: boolean) => {
    if (assigned) {
      await axios.patch(`/api/features/${featureId}/unassign-tenant/${tenant}`);
    } else {
      await axios.patch(`/api/features/${featureId}/assign-tenant/${tenant}`);
    }
    fetchFeatures();
  };

  const flattenFeatures = (nodes: FeatureNode[], parentPath = ''): FeatureNode[] => {
    let flat: FeatureNode[] = [];
    for (const node of nodes) {
      flat.push({ ...node, name: parentPath ? `${parentPath} > ${node.name}` : node.name });
      if (node.children && node.children.length > 0) {
        flat = flat.concat(flattenFeatures(node.children, node.name));
      }
    }
    return flat;
  };

  const flatFeatures = flattenFeatures(features);

  const downloadCSV = () => {
    const header = ['Feature', ...roles, ...tenants];
    const rows = flatFeatures.map(feature => [
      feature.name,
      ...roles.map(role => (feature.allowedRoles?.includes(role) ? '✔' : '')),
      ...tenants.map(tenant => (feature.allowedTenants?.includes(tenant) ? '✔' : ''))
    ]);
    const csvContent = [header, ...rows]
      .map(row => row.map(field => '"' + String(field).replace(/"/g, '""') + '"').join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'permissions-matrix.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="permissions-matrix">
      <h3>Permissions Matrix</h3>
      <button onClick={downloadCSV} className="permissions-matrix-download-btn">Download CSV</button>
      <div className="permissions-matrix-table-container">
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              {roles.map(role => <th key={role}>{role}</th>)}
              {tenants.map(tenant => <th key={tenant}>{tenant}</th>)}
            </tr>
          </thead>
          <tbody>
            {flatFeatures.map(feature => (
              <tr key={feature.id}>
                <td>{feature.name}</td>
                {roles.map(role => (
                  <td key={role}>
                    <input
                      type="checkbox"
                      checked={feature.allowedRoles?.includes(role) || false}
                      aria-label={`Toggle role '${role}' for feature '${feature.name}'`}
                      onChange={() => handleToggleRole(feature.id, role, feature.allowedRoles?.includes(role) || false)}
                    />
                  </td>
                ))}
                {tenants.map(tenant => (
                  <td key={tenant}>
                    <input
                      type="checkbox"
                      checked={feature.allowedTenants?.includes(tenant) || false}
                      aria-label={`Toggle tenant '${tenant}' for feature '${feature.name}'`}
                      onChange={() => handleToggleTenant(feature.id, tenant, feature.allowedTenants?.includes(tenant) || false)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PermissionsMatrix;
