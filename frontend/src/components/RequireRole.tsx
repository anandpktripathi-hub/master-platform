import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types/rbac';

interface RequireRoleProps {
  roles: Role | Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode; // If provided, show this instead of redirecting
}

/**
 * Component that requires user to have one or more specific roles.
 * If user doesn't have required role, redirects to /not-authorized.
 */
export function RequireRole({ roles, children, fallback }: RequireRoleProps) {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(roles)) {
    if (fallback) return <>{fallback}</>;
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;
}
