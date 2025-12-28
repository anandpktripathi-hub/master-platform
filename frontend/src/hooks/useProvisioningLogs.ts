export type { ProvisioningResourceType } from '../types/api.types';
import { useMemo } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import api from '../api/client';
import usePollingQuery from './usePollingQuery';
import type { ProvisioningLog } from '../types/api.types';

export type ProvisioningResourceType = 'domain' | 'custom-domain';

interface UseProvisioningLogsOptions {
  enabled?: boolean;
  pollWhile?: string[];
}

function getEndpoint(type: ProvisioningResourceType, id: string) {
  if (type === 'custom-domain') {
    return `/custom-domains/${id}/logs`;
  }
  return `/domains/${id}/logs`;
}

export function useProvisioningLogs(
  type: ProvisioningResourceType,
  id: string,
  options: UseProvisioningLogsOptions = {}
): UseQueryResult<ProvisioningLog[], Error> {
  const { enabled = true, pollWhile = ['pending', 'pending_verification', 'verified', 'ssl_pending'] } = options;

  const endpoint = useMemo(() => getEndpoint(type, id), [type, id]);

  return usePollingQuery<ProvisioningLog[]>(
    ['provisioningLogs', type, id],
    async () => {
      try {
        const data = await api.get(endpoint);
        return (data as ProvisioningLog[]) || [];
      } catch (error: any) {
        // Backend may not expose provisioning log endpoints yet; fall back to empty logs
        if (error?.status === 404 || error?.response?.status === 404) {
          return [];
        }
        throw error;
      }
    },
    {
      enabled: enabled && !!id,
      refetchInterval: (data) => {
        const latest = data?.[0];
        if (!latest) return false;
        // Keep polling while status is transitional
        return pollWhile.includes(latest.status) ? 5000 : false;
      },
    }
  );
}

export default useProvisioningLogs;
