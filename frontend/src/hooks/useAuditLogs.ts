import { useQuery, UseQueryResult } from '@tanstack/react-query';
import api from '../services/api';
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
 */
export function useAuditLogs(filters?: AuditLogFilters): UseQueryResult<PaginatedResponse<AuditLog>, Error> {
  return useQuery({
    queryKey: auditLogKeys.list(filters),
    queryFn: async () => {
      const page = filters?.page && filters.page > 0 ? filters.page : 1;
      const limit = filters?.limit && filters.limit > 0 ? filters.limit : 25;
      const skip = (page - 1) * limit;

      const data = await api.get('/audit-log', {
        params: {
          limit,
          skip,
          ...(filters?.resourceType ? { resourceType: filters.resourceType } : {}),
          ...(filters?.resourceId ? { resourceId: filters.resourceId } : {}),
          ...(filters?.action ? { action: filters.action } : {}),
          ...(filters?.startDate ? { startDate: filters.startDate } : {}),
          ...(filters?.endDate ? { endDate: filters.endDate } : {}),
        },
      } as any);

      if (Array.isArray(data)) {
        const total = data.length;
        return {
          data,
          total,
          page,
          limit: total,
          totalPages: 1,
        } as PaginatedResponse<AuditLog>;
      }

      const total = typeof (data as any)?.total === 'number' ? (data as any).total : 0;
      const rows = Array.isArray((data as any)?.data) ? ((data as any).data as AuditLog[]) : [];
      const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;

      return {
        data: rows,
        total,
        page,
        limit,
        totalPages,
      } as PaginatedResponse<AuditLog>;
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
      const data = await api.get('/audit-log', {
        params: { limit: 200, skip: 0, resourceType, resourceId, sortBy: '-createdAt' },
      } as any);

      if (Array.isArray(data)) {
        return data as AuditLog[];
      }

      const rows = Array.isArray((data as any)?.data) ? ((data as any).data as AuditLog[]) : [];
      return rows;
    },
    enabled: !!resourceType && !!resourceId,
  });
}
