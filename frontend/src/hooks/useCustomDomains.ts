import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import api from '../services/api';
import { useApiErrorToast } from '../providers/QueryProvider';
import usePollingQuery from './usePollingQuery';
import type {
  CustomDomain,
  CreateCustomDomainDto,
  UpdateCustomDomainDto,
  VerifyCustomDomainDto,
} from '../types/api.types';

/**
 * Query keys for custom domains
 */
export const customDomainKeys = {
  all: ['customDomains'] as const,
  lists: () => [...customDomainKeys.all, 'list'] as const,
  list: (filters?: string) => [...customDomainKeys.lists(), filters] as const,
  details: () => [...customDomainKeys.all, 'detail'] as const,
  detail: (id: string) => [...customDomainKeys.details(), id] as const,
};

const extractList = (response: any): CustomDomain[] => {
  if (Array.isArray(response)) return response as CustomDomain[];
  if (response?.data && Array.isArray(response.data)) return response.data as CustomDomain[];
  return [];
};

/**
 * Fetch tenant's custom domains (GET /custom-domains/me)
 */
export function useCustomDomainsList(): UseQueryResult<CustomDomain[], Error> {
  return useQuery({
    queryKey: customDomainKeys.lists(),
    queryFn: async () => {
      const data = await api.get('/custom-domains/me');
      return extractList(data);
    },
  });
}

/**
 * Fetch single custom domain by ID (for polling status)
 */
export function useCustomDomainDetail(id: string, enabled = true): UseQueryResult<CustomDomain, Error> {
  return useQuery({
    queryKey: customDomainKeys.detail(id),
    queryFn: async () => {
      const data = await api.get('/custom-domains/me');
      const list = extractList(data);
      const match = list.find((d) => d._id === id);
      if (!match) {
        throw new Error('Custom domain not found');
      }
      return match;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Request a custom domain (POST /custom-domains/me)
 */
export function useRequestCustomDomain(): UseMutationResult<CustomDomain, Error, CreateCustomDomainDto> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async (dto: CreateCustomDomainDto) => {
      const data = await api.post('/custom-domains/me', dto);
      return data as CustomDomain;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customDomainKeys.lists() });
      showSuccessToast(`Custom domain "${data.domain}" requested successfully!`);
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

/**
 * Update custom domain (PATCH /custom-domains/me/:id)
 */
export function useUpdateCustomDomain(): UseMutationResult<
  CustomDomain,
  Error,
  { id: string; dto: UpdateCustomDomainDto }
> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateCustomDomainDto }) => {
      const data = await api.patch(`/custom-domains/me/${id}`, dto);
      return data as CustomDomain;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customDomainKeys.lists() });
      showSuccessToast('Custom domain updated successfully!');
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

/**
 * Verify custom domain ownership (POST /custom-domains/me/:id/verify)
 */
export function useVerifyCustomDomain(): UseMutationResult<
  { verified: boolean; domainId: string },
  Error,
  { id: string; dto?: VerifyCustomDomainDto }
> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto?: VerifyCustomDomainDto }) => {
      const data = await api.post(`/custom-domains/me/${id}/verify`, dto);
      return data as { verified: boolean; domainId: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customDomainKeys.lists() });
      if (data?.domainId) {
        queryClient.invalidateQueries({ queryKey: customDomainKeys.detail(data.domainId) });
      }
      if (data?.verified) {
        showSuccessToast('Domain verified successfully!');
      }
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

/**
 * Issue SSL certificate (POST /custom-domains/me/:id/ssl/issue)
 */
export function useIssueSsl(): UseMutationResult<CustomDomain, Error, string> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async (domainId: string) => {
      const data = await api.post(`/custom-domains/me/${domainId}/ssl/issue`);
      return data as CustomDomain;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customDomainKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customDomainKeys.detail(data._id) });
      showSuccessToast(`SSL issuance initiated for "${data.domain}"!`);
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

/**
 * Set primary custom domain (POST /custom-domains/me/:id/primary)
 */
export function useSetPrimaryCustomDomain(): UseMutationResult<CustomDomain, Error, string> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async (domainId: string) => {
      const data = await api.post(`/custom-domains/me/${domainId}/primary`);
      return data as CustomDomain;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customDomainKeys.lists() });
      showSuccessToast(`"${data.domain}" set as primary custom domain!`);
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

/**
 * Delete custom domain (DELETE /custom-domains/me/:id)
 */
export function useDeleteCustomDomain(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async (domainId: string) => {
      await api.delete(`/custom-domains/me/${domainId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customDomainKeys.lists() });
      showSuccessToast('Custom domain deleted successfully!');
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

// ============================================================================
// POLLING HOOK FOR DOMAIN STATUS
// ============================================================================

/**
 * Poll custom domain status while in transitional states
 * Useful for verification and SSL issuance workflows
 */
export function useDomainStatusPolling(
  domainId: string,
  enabled = true
): UseQueryResult<CustomDomain, Error> {
  return usePollingQuery<CustomDomain>(
    customDomainKeys.detail(domainId),
    async () => {
      const data = await api.get('/custom-domains/me');
      const list = extractList(data);
      const match = list.find((d) => d._id === domainId);
      if (!match) {
        throw new Error('Custom domain not found');
      }
      return match;
    },
    {
      enabled: enabled && !!domainId,
      refetchInterval: (data) => {
        const transitionalStates = ['pending_verification', 'verified', 'ssl_pending', 'ssl_issued'];
        if (data && transitionalStates.includes(data.status)) {
          return 5000;
        }
        return false;
      },
    }
  );
}

// ============================================================================
// ADMIN HOOKS (for PLATFORM_SUPERADMIN)
// ============================================================================

/**
 * Fetch all custom domains (admin) (GET /custom-domains)
 */
export function useAdminCustomDomainsList(): UseQueryResult<CustomDomain[], Error> {
  return useQuery({
    queryKey: [...customDomainKeys.all, 'admin'],
    queryFn: async () => {
      const data = await api.get('/custom-domains');
      return data as CustomDomain[];
    },
  });
}

/**
 * Admin: Activate custom domain (POST /custom-domains/:id/activate)
 */
export function useAdminActivateCustomDomain(): UseMutationResult<CustomDomain, Error, string> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async (domainId: string) => {
      const data = await api.post(`/custom-domains/${domainId}/activate`);
      return data as CustomDomain;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: customDomainKeys.all });
      showSuccessToast(`Custom domain "${data.domain}" activated!`);
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

/**
 * Admin: Update any custom domain (PATCH /custom-domains/:id)
 */
export function useAdminUpdateCustomDomain(): UseMutationResult<
  CustomDomain,
  Error,
  { id: string; dto: UpdateCustomDomainDto }
> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateCustomDomainDto }) => {
      const data = await api.patch(`/custom-domains/${id}`, dto);
      return data as CustomDomain;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customDomainKeys.all });
      showSuccessToast('Custom domain updated successfully!');
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}
