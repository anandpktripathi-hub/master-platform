/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface Tenant {
  domain: string;
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

  const fetchTenants = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Note: TenantContext uses axios directly, not our api instance
      // This still needs .data access since it doesn't use our interceptor
      const res = await axios.get<Tenant[]>('/tenants');
      if (res.data) {
        setTenants(res.data.map((t) => t.domain));
        // Load saved tenant from localStorage
        const savedTenantId = localStorage.getItem('tenantId');
        const selectedTenant = res.data.find((t) => t.domain === savedTenantId)?.domain || res.data[0]?.domain || '';
        setTenantId(selectedTenant);
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
    // Save tenant selection to localStorage
    localStorage.setItem('tenantId', id);
  };

  return (
    <TenantContext.Provider value={{ tenantId, setTenantId: handleSetTenantId, tenants, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
}

export const TenantProvider = TenantProviderComponent;

