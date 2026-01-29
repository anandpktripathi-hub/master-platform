import React, { useState } from 'react';
import FeatureManager from '../../admin/FeatureManager';
import PermissionsMatrix from '../../admin/PermissionsMatrix';
import AuditLogViewer from '../../admin/AuditLogViewer';
import AnalyticsDashboard from '../../admin/AnalyticsDashboard';
import './index.css';

const AdminIndex: React.FC = () => {
  const [showMatrix, setShowMatrix] = useState(false);
  const roles = ['admin', 'manager', 'user'];
  const tenants = ['tenant1', 'tenant2', 'tenant3'];

  const [showAudit, setShowAudit] = useState(false);
  return (
    <div>
      <h1>Admin Panel</h1>
      <button onClick={() => setShowMatrix(!showMatrix)}>
        {showMatrix ? 'Hide' : 'Show'} Permissions Matrix
      </button>
      <button onClick={() => setShowAudit(!showAudit)} className="admin-panel-button">
        {showAudit ? 'Hide' : 'Show'} Audit Log
      </button>
      {showMatrix && <PermissionsMatrix roles={roles} tenants={tenants} />}
      {showAudit && <AuditLogViewer />}
      <AnalyticsDashboard />
      <FeatureManager />
    </div>
  );
};

export default AdminIndex;
