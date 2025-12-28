import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../contexts/AuthContext';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';

/**
 * RequireAuth - Protects routes that require authentication
 * Redirects to /login if not authenticated
 */
interface RequireAuthProps {
  children: ReactNode;
  redirectTo?: string;
}

export function RequireAuth({ children, redirectTo = '/login' }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, but save the attempted location
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/**
 * RequireRole - Protects routes that require specific roles
 * Shows "Not Authorized" message if user lacks required role
 */
interface RequireRoleProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export function RequireRole({ children, allowedRoles, fallback }: RequireRoleProps) {
  const { hasRole, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const userHasRole = hasRole(allowedRoles);

  if (!userHasRole) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            maxWidth: 500,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" color="error" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            You do not have permission to access this page.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Required roles: {allowedRoles.join(', ')}
          </Typography>
          {user && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Your role: {user.role}
            </Typography>
          )}
        </Paper>
      </Box>
    );
  }

  return <>{children}</>;
}

/**
 * RequireTenantAdmin - Convenience wrapper for tenant admin routes
 */
export function RequireTenantAdmin({ children }: { children: ReactNode }) {
  return (
    <RequireRole allowedRoles={['TENANT_ADMIN', 'PLATFORM_SUPERADMIN']}>
      {children}
    </RequireRole>
  );
}

/**
 * RequirePlatformAdmin - Convenience wrapper for platform admin routes
 */
export function RequirePlatformAdmin({ children }: { children: ReactNode }) {
  return (
    <RequireRole allowedRoles={['PLATFORM_SUPERADMIN']}>
      {children}
    </RequireRole>
  );
}

/**
 * Higher-order component version of RequireAuth
 */
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function WrappedComponent(props: P) {
    return (
      <RequireAuth>
        <Component {...props} />
      </RequireAuth>
    );
  };
}

/**
 * Higher-order component version of RequireRole
 */
export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[]
) {
  return function WrappedComponent(props: P) {
    return (
      <RequireRole allowedRoles={allowedRoles}>
        <Component {...props} />
      </RequireRole>
    );
  };
}
