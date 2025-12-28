import React from 'react';
import { Chip } from '@mui/material';

interface StatusChipProps {
  label: string;
  status: string;
  mapping?: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary'>;
  size?: 'small' | 'medium';
}

const DEFAULT_MAP: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  active: 'success',
  pending: 'warning',
  pending_verification: 'warning',
  verified: 'info',
  ssl_pending: 'warning',
  ssl_issued: 'success',
  suspended: 'error',
  blocked: 'error',
  failed: 'error',
  trial: 'info',
  expired: 'error',
};

export function StatusChip({ label, status, mapping = DEFAULT_MAP, size = 'small' }: StatusChipProps) {
  const color = mapping[status] || 'default';
  return <Chip label={label} color={color} size={size} />;
}

export default StatusChip;
