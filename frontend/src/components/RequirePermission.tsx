import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types/rbac';

interface RequirePermissionProps {
  permissions: Permission | Permission[];
  mode?: 'all' | 'any'; // 'all' = user must have all permissions, 'any' = user must have at least one
  children: React.ReactNode;
  fallback?: React.ReactNode; // If provided, show this instead of redirecting
}

/**
 * Component that requires user to have specific permission(s).
 * mode='all': user must have ALL listed permissions (default).
 * mode='any': user must have ANY ONE of the listed permissions.
 * If user doesn't have required permission(s), redirects to /not-authorized.
 */
export function RequirePermission({
  permissions,
  mode = 'all',
  children,
  fallback,
}: RequirePermissionProps) {
  const { isAuthenticated, loading } = useAuth();
  const auth = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasPerms =
    mode === 'all'
      ? auth.hasAllPermissions(Array.isArray(permissions) ? permissions : [permissions])
      : auth.hasAnyPermission(Array.isArray(permissions) ? permissions : [permissions]);

  if (!hasPerms) {
    if (fallback) return <>{fallback}</>;
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;
}
