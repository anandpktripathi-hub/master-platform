import { useQuery, UseQueryResult } from '@tanstack/react-query';
import api from '../api/client';
import type { AuditLog, AuditLogFilters, PaginatedResponse } from '../types/api.types';

/**
 * Query keys for audit logs
 */
export const auditLogKeys = {
  all: ['auditLogs'] as const,
  lists: () => [...auditLogKeys.all, 'list'] as const,
  list: (filters?: AuditLogFilters) => [...auditLogKeys.lists(), filters] as const,
};

/**
 * Fetch audit logs with filters
 * Note: This assumes backend has a GET /audit-logs endpoint
 * You may need to create this endpoint if it doesn't exist
 */
export function useAuditLogs(filters?: AuditLogFilters): UseQueryResult<PaginatedResponse<AuditLog>, Error> {
  return useQuery({
    queryKey: auditLogKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.tenantId) params.append('tenantId', filters.tenantId);
      if (filters?.resourceType) params.append('resourceType', filters.resourceType);
      if (filters?.resourceId) params.append('resourceId', filters.resourceId);
      if (filters?.action) params.append('action', filters.action);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const data = await api.get(`/audit-logs?${params.toString()}`);

      // Support both paginated and array-only responses
      if (Array.isArray(data)) {
        return {
          data,
          total: data.length,
          page: filters?.page ?? 1,
          limit: filters?.limit ?? data.length,
          totalPages: 1,
        } as PaginatedResponse<AuditLog>;
      }

      return data as PaginatedResponse<AuditLog>;
    },
    enabled: !!filters,
  });
}

/**
 * Fetch audit logs for a specific resource
 */
export function useResourceAuditLogs(
  resourceType: string,
  resourceId: string
): UseQueryResult<AuditLog[], Error> {
  return useQuery({
    queryKey: [...auditLogKeys.all, 'resource', resourceType, resourceId],
    queryFn: async () => {
      const data = await api.get(`/audit-logs/resource/${resourceType}/${resourceId}`);
      return data as AuditLog[];
    },
    enabled: !!resourceType && !!resourceId,
  });
}
