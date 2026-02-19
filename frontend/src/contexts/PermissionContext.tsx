import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

export interface Permission {
  module: string;
  action: string;
  fields?: string[];
}

interface PermissionContextValue {
  permissions: Permission[];
  isLoading: boolean;
  hasPermission: (module: string, action: string) => boolean;
  hasFieldPermission: (module: string, action: string, field: string) => boolean;
  refresh: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPermissions = async () => {
    setIsLoading(true);
    try {
      const resp = await api.get("/rbac/permissions");
      setPermissions(resp as Permission[]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const hasPermission = (module: string, action: string) => {
    return permissions.some((p) => p.module === module && p.action === action);
  };

  const hasFieldPermission = (module: string, action: string, field: string) => {
    const perm = permissions.find((p) => p.module === module && p.action === action);
    if (!perm) return false;
    if (!perm.fields || perm.fields.length === 0) return false;
    return perm.fields.includes(field);
  };

  return (
    <PermissionContext.Provider value={{ permissions, isLoading, hasPermission, hasFieldPermission, refresh: fetchPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissionContext = () => {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error("PermissionContext not found");
  return ctx;
};
