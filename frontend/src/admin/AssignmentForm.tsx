import React, { useState } from 'react';
import { FeatureNode } from './FeatureManager';

interface AssignmentFormProps {
  node: FeatureNode;
  onAssignRole: (role: string) => void;
  onUnassignRole: (role: string) => void;
  onAssignTenant: (tenant: string) => void;
  onUnassignTenant: (tenant: string) => void;
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ node, onAssignRole, onUnassignRole, onAssignTenant, onUnassignTenant }) => {
  const [role, setRole] = useState('');
  const [tenant, setTenant] = useState('');

  return (
    <div className="assignment-form">
      <h4>Role/Tenant Assignment</h4>
      <div>
        <input
          type="text"
          placeholder="Role name"
          value={role}
          onChange={e => setRole(e.target.value)}
        />
        <button type="button" onClick={() => { onAssignRole(role); setRole(''); }}>Assign Role</button>
      </div>
      <div>
        {node.allowedRoles && node.allowedRoles.map(r => (
          <span key={r} className="assignment-chip">
            {r} <button type="button" onClick={() => onUnassignRole(r)}>x</button>
          </span>
        ))}
      </div>
      <div>
        <input
          type="text"
          placeholder="Tenant ID"
          value={tenant}
          onChange={e => setTenant(e.target.value)}
        />
        <button type="button" onClick={() => { onAssignTenant(tenant); setTenant(''); }}>Assign Tenant</button>
      </div>
      <div>
        {node.allowedTenants && node.allowedTenants.map(t => (
          <span key={t} className="assignment-chip">
            {t} <button type="button" onClick={() => onUnassignTenant(t)}>x</button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default AssignmentForm;
