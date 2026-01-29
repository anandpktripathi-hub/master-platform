import React from "react";
import { usePermissionContext } from "../contexts/PermissionContext";

interface RequireFieldPermissionProps {
  module: string;
  action: string;
  field: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that requires user to have field-level permission.
 * If not allowed, renders fallback or nothing.
 */
export const RequireFieldPermission: React.FC<RequireFieldPermissionProps> = ({
  module,
  action,
  field,
  children,
  fallback = null,
}) => {
  const { isLoading, hasFieldPermission } = usePermissionContext();
  if (isLoading) return null;
  if (!hasFieldPermission(module, action, field)) return <>{fallback}</>;
  return <>{children}</>;
};
