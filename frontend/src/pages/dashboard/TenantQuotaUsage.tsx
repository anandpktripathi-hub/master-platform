import React from "react";
import { ProtectedRoute } from "../../components/ProtectedRoute";

const TenantQuotaUsage: React.FC = () => {
  const [quota, setQuota] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchQuota() {
      setLoading(true);
      setError(null);
      try {
        // Replace with actual API endpoint for tenant quota/usage
        const response = await import('../../services/api').then(({ tenantsApi }) => tenantsApi.get('/tenant/quota'));
        setQuota(response.quota || response);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch quota');
      } finally {
        setLoading(false);
      }
    }
    fetchQuota();
  }, []);

  return (
    <ProtectedRoute>
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Tenant Quota & Usage</h2>
        {loading ? <p>Loading...</p> : error ? <p className="text-red-500">{error}</p> : quota ? (
          <div>
            <p><strong>Max Users:</strong> {quota.maxUsers}</p>
            <p><strong>Storage (MB):</strong> {quota.storageMb}</p>
            <p><strong>API Calls/Day:</strong> {quota.maxApiCallsPerDay}</p>
            <p><strong>Current Usage:</strong> {quota.usage ? JSON.stringify(quota.usage) : 'N/A'}</p>
          </div>
        ) : <p>No quota data available.</p>}
      </div>
    </ProtectedRoute>
  );
};

export default TenantQuotaUsage;
