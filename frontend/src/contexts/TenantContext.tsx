import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const TenantContext = createContext<{
  tenantId: string;
  setTenantId: (id: string) => void;
  tenants: string[];
  loading: boolean;
  error: string | null;
}>({
  tenantId: '',
  setTenantId: () => {},
  tenants: [],
  loading: false,
  error: null,
});

export const useTenantContext = () => useContext(TenantContext);

export const TenantProvider = ({ children }) => {
  const [tenantId, setTenantId] = useState('');
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get('/tenants')
      .then(res => {
        setTenants(res.data.map(t => t.domain));
        // Load saved tenant from localStorage
        const savedTenantId = localStorage.getItem('tenantId');
        const selectedTenant = res.data.find(t => t.domain === savedTenantId)?.domain || res.data[0]?.domain;
        setTenantId(selectedTenant);
      })
      .catch(err => {
        setError('Failed to load tenants');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSetTenantId = (id) => {
    setTenantId(id);
    // Save tenant selection to localStorage
    localStorage.setItem('tenantId', id);
  };

  return (
    <TenantContext.Provider value={{ tenantId, setTenantId: handleSetTenantId, tenants, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
};

