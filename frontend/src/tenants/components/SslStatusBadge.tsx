import React from 'react';

const SslStatusBadge: React.FC<{ ssl: boolean }> = ({ ssl }) => (
  <span className={`px-2 py-0.5 rounded text-xs text-white ${ssl ? 'bg-green-600' : 'bg-gray-400'}`}>{ssl ? 'SSL Enabled' : 'No SSL'}</span>
);

export default SslStatusBadge;
