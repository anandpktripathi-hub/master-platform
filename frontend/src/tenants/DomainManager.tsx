import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DomainVerify from './DomainVerify';
import DomainStatusBadge from './components/DomainStatusBadge';
import SslStatusBadge from './components/SslStatusBadge';

interface Domain {
  domain: string;
  verified: boolean;
  verificationToken: string;
  status: string;
  verifiedAt?: string;
  ssl?: boolean;
}

const DomainManager: React.FC<{ tenantId: string }> = ({ tenantId }) => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/tenants/${tenantId}/domains`);
      const domainsWithSsl = await Promise.all(
        res.data.map(async (d: Domain) => {
          try {
            const sslRes = await axios.get(`/api/tenants/ssl/${d.domain}/status`);
            return { ...d, ssl: sslRes.data.ssl };
          } catch {
            return { ...d, ssl: false };
          }
        })
      );
      setDomains(domainsWithSsl);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to fetch domains');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
    // TODO: WebSocket for real-time updates
  }, [tenantId]);

  const handleAddDomain = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/tenants/domain/map', { domain: newDomain });
      setDomains((prev) => [...prev, { domain: newDomain, ...res.data, verified: false, status: 'PENDING' }]);
      setNewDomain('');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to add domain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Custom Domains</h2>
      <div className="mb-4 flex gap-2">
        <input
          className="border px-2 py-1 rounded w-full"
          placeholder="yourdomain.com"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-1 rounded"
          onClick={handleAddDomain}
          disabled={loading || !newDomain}
        >
          Add
        </button>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div>
        {domains.map((d) => (
          <div key={d.domain} className="flex items-center gap-4 border-b py-2">
            <span className="font-mono">{d.domain}</span>
            <DomainStatusBadge status={d.status} />
            <SslStatusBadge ssl={!!d.ssl} />
            {!d.verified && (
              <DomainVerify domain={d.domain} token={d.verificationToken} tenantId={tenantId} onVerified={fetchDomains} />
            )}
            {d.verified && <span className="text-green-600">Verified</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DomainManager;
