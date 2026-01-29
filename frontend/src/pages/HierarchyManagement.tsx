import React from 'react';
import { HierarchyManager } from '../modules/hierarchy';

const HierarchyManagement: React.FC = () => {
  return (
    <div className="page-container">
      <h1>Feature & Module Hierarchy Management</h1>
      <HierarchyManager />
    </div>
  );
};

export default HierarchyManagement;
