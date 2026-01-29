import React from 'react';

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-400' },
  VERIFIED: { label: 'Verified', color: 'bg-green-500' },
  FAILED: { label: 'Failed', color: 'bg-red-500' },
};

const DomainStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const s = statusMap[status] || statusMap.PENDING;
  return (
    <span className={`px-2 py-0.5 rounded text-xs text-white ${s.color}`}>{s.label}</span>
  );
};

export default DomainStatusBadge;
