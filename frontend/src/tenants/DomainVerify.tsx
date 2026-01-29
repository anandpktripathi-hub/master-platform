import React, { useState } from 'react';
import axios from 'axios';

interface Props {
  domain: string;
  token: string;
  tenantId: string;
  onVerified: () => void;
}

const DomainVerify: React.FC<Props> = ({ domain, token, tenantId, onVerified }) => {
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleVerify = async () => {
    setVerifying(true);
    setError('');
    try {
      await axios.post('/api/tenants/domain/verify', { domain, token });
      setSuccess(true);
      onVerified();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-gray-600">Add this TXT record to your DNS:</div>
      <div className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{token}</div>
      <button
        className="bg-green-600 text-white px-3 py-1 rounded mt-1"
        onClick={handleVerify}
        disabled={verifying || success}
      >
        {success ? 'Verified!' : verifying ? 'Verifying...' : 'Verify'}
      </button>
      {error && <div className="text-red-600 text-xs">{error}</div>}
    </div>
  );
};

export default DomainVerify;
