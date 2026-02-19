/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

interface Tenant {
  _id?: string;
  id?: string;
  domain?: string;
  slug?: string;
}

interface TenantContextValue {
  tenantId: string;
  setTenantId: (id: string) => void;
  tenants: string[];
  loading: boolean;
  error: string | null;
}

interface TenantProviderProps {
  children: React.ReactNode;
}

export const TenantContext = createContext<TenantContextValue>({
  tenantId: '',
  setTenantId: () => {},
  tenants: [],
  loading: false,
  error: null,
});

function useTenantContextHook() {
  return useContext(TenantContext);
}

export const useTenantContext = useTenantContextHook;

/* eslint-enable react-refresh/only-export-components */

function TenantProviderComponent({ children }: TenantProviderProps) {
  const [tenantId, setTenantId] = useState<string>('');
  const [tenants, setTenants] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // One-time migration: older code used `tenantId`; canonical key is `workspaceId`.
      const legacyTenantId = localStorage.getItem('tenantId');
      const existingWorkspaceId = localStorage.getItem('workspaceId');
      if (!existingWorkspaceId && legacyTenantId) {
        localStorage.setItem('workspaceId', legacyTenantId);
        localStorage.removeItem('tenantId');
      }

      // There is no GET /tenants listing endpoint; use authenticated tenant identity.
      const res = (await api.get('/tenants/me')) as unknown as Tenant | null;
      if (!res) {
        setTenants([]);
        setTenantId('');
        return;
      }

      const resolvedTenantId = String(res._id ?? res.id ?? '');
      const tenantLabel = String(res.domain ?? res.slug ?? resolvedTenantId);

      setTenants(tenantLabel ? [tenantLabel] : []);

      const savedWorkspaceId = localStorage.getItem('workspaceId');
      const selected = savedWorkspaceId ? String(savedWorkspaceId) : resolvedTenantId;

      if (selected) {
        setTenantId(selected);
        // Keep API header behavior consistent across the app
        localStorage.setItem('workspaceId', selected);
      }
    } catch {
      setError('Failed to load tenants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTenants();
  }, [fetchTenants]);

  const handleSetTenantId = (id: string) => {
    setTenantId(id);
    // Save selection to canonical key
    localStorage.setItem('workspaceId', id);
  };

  return (
    <TenantContext.Provider value={{ tenantId, setTenantId: handleSetTenantId, tenants, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
}

export const TenantProvider = TenantProviderComponent;

