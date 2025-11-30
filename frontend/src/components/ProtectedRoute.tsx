import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useTenantContext } from '../contexts/TenantContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuthContext();
  const { tenantId } = useTenantContext();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!tenantId) {
    return <Navigate to="/select-tenant" />;
  }

  return children;
};

export default ProtectedRoute;
