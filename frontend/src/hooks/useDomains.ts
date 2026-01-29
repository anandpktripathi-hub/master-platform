import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import api from '../api/client';
import { useApiErrorToast } from '../providers/QueryProvider';
import type {
  Domain,
  CreateDomainDto,
  UpdateDomainDto,
  DomainAvailability,
} from '../types/api.types';

/**
 * Query keys for domains
 */
export const domainKeys = {
  all: ['domains'] as const,
  lists: () => [...domainKeys.all, 'list'] as const,
  list: (filters?: string) => [...domainKeys.lists(), filters] as const,
  details: () => [...domainKeys.all, 'detail'] as const,
  detail: (id: string) => [...domainKeys.details(), id] as const,
  availability: (type: string, value: string) => [...domainKeys.all, 'availability', type, value] as const,
};

/**
 * Fetch tenant's domains (GET /domains/me)
 */
export function useDomainsList(): UseQueryResult<Domain[], Error> {
  return useQuery({
    queryKey: domainKeys.lists(),
    queryFn: async () => {
      const response = await api.get('/domains/me');
      // API returns a paginated envelope { data, total, limit, skip }
      if (Array.isArray(response)) return response as Domain[];
      return (response as any)?.data ?? [];
    },
  });
}

/**
 * Check domain availability (GET /domains/availability)
 */
export function useCheckDomainAvailability(
  type: string,
  value: string,
  enabled = false
): UseQueryResult<DomainAvailability, Error> {
  return useQuery({
    queryKey: domainKeys.availability(type, value),
    queryFn: async () => {
      const data = await api.get('/domains/availability', {
        params: { type, value },
      });
      return data as DomainAvailability;
    },
    enabled: enabled && !!type && !!value,
  });
}

/**
 * Create a new domain (POST /domains/me)
 */
export function useCreateDomain(): UseMutationResult<Domain, Error, CreateDomainDto> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async (dto: CreateDomainDto) => {
      const data = await api.post('/domains/me', dto);
      return data as Domain;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: domainKeys.lists() });
      showSuccessToast(`Domain "${data.value}" created successfully!`);
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

/**
 * Update domain (PATCH /domains/me/:id)
 */
export function useUpdateDomain(): UseMutationResult<
  Domain,
  Error,
  { id: string; dto: UpdateDomainDto }
> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateDomainDto }) => {
      const data = await api.patch(`/domains/me/${id}`, dto);
      return data as Domain;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainKeys.lists() });
      showSuccessToast('Domain updated successfully!');
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

/**
 * Set primary domain (POST /domains/me/:id/primary)
 */
export function useSetPrimaryDomain(): UseMutationResult<Domain, Error, string> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async (domainId: string) => {
      const data = await api.post(`/domains/me/${domainId}/primary`);
      return data as Domain;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: domainKeys.lists() });
      showSuccessToast(`"${data.value}" set as primary domain!`);
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

/**
 * Delete domain (DELETE /domains/me/:id)
 */
export function useDeleteDomain(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async (domainId: string) => {
      await api.delete(`/domains/me/${domainId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainKeys.lists() });
      showSuccessToast('Domain deleted successfully!');
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

// ============================================================================
// ADMIN HOOKS (for PLATFORM_SUPERADMIN)
// ============================================================================

/**
 * Fetch all domains (admin) (GET /domains)
 */
export function useAdminDomainsList(): UseQueryResult<Domain[], Error> {
  return useQuery({
    queryKey: [...domainKeys.all, 'admin'],
    queryFn: async () => {
      const response = await api.get('/domains');
      // Backend returns a paginated envelope { data, total, limit, skip }
      if (Array.isArray(response)) {
        return response as Domain[];
      }
      return (response as any)?.data ?? [];
    },
  });
}

/**
 * Admin: Create domain for any tenant (POST /domains)
 */
export function useAdminCreateDomain(): UseMutationResult<
  Domain,
  Error,
  CreateDomainDto & { tenantId: string }
> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async (dto: CreateDomainDto & { tenantId: string }) => {
      const data = await api.post('/domains', dto);
      return data as Domain;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainKeys.all });
      showSuccessToast('Domain created successfully!');
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

/**
 * Admin: Update any domain (PATCH /domains/:id)
 */
export function useAdminUpdateDomain(): UseMutationResult<
  Domain,
  Error,
  { id: string; dto: UpdateDomainDto }
> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateDomainDto }) => {
      const data = await api.patch(`/domains/${id}`, dto);
      return data as Domain;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainKeys.all });
      showSuccessToast('Domain updated successfully!');
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

/**
 * Admin: Set primary domain for any tenant (POST /domains/:id/primary)
 */
export function useAdminSetPrimaryDomain(): UseMutationResult<Domain, Error, string> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async (domainId: string) => {
      const data = await api.post(`/domains/${domainId}/primary`);
      return data as Domain;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainKeys.all });
      showSuccessToast('Primary domain set successfully!');
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

/**
 * Admin: Delete any domain (DELETE /domains/:id)
 */
export function useAdminDeleteDomain(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async (domainId: string) => {
      await api.delete(`/domains/${domainId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: domainKeys.all });
      showSuccessToast('Domain deleted successfully!');
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}
