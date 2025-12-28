import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import api from '../api/client';
import { useApiErrorToast } from '../providers/QueryProvider';
import type {
  Package,
  CreatePackageDto,
  UpdatePackageDto,
  TenantPackage,
  AssignPackageDto,
  PackageUsage,
} from '../types/api.types';

/**
 * Query keys for packages
 */
export const packageKeys = {
  all: ['packages'] as const,
  lists: () => [...packageKeys.all, 'list'] as const,
  list: (filters?: string) => [...packageKeys.lists(), filters] as const,
  details: () => [...packageKeys.all, 'detail'] as const,
  detail: (id: string) => [...packageKeys.details(), id] as const,
  current: () => [...packageKeys.all, 'current'] as const,
  usage: () => [...packageKeys.all, 'usage'] as const,
  canUse: (feature: string) => [...packageKeys.all, 'canUse', feature] as const,
};

// ============================================================================
// PUBLIC / TENANT HOOKS
// ============================================================================

/**
 * Fetch public/active packages (GET /packages)
 * Available to all users for viewing package catalog
 */
export function usePublicPackages(): UseQueryResult<Package[], Error> {
  return useQuery({
    queryKey: packageKeys.lists(),
    queryFn: async () => {
      const data = await api.get('/packages');
      // Backend responds with { data, total, limit, skip }
      if (Array.isArray(data)) return data as Package[];
      return (data as any)?.data ?? [];
    },
  });
}

/**
 * Fetch current tenant's package (GET /packages/me)
 */
export function useCurrentPackage(): UseQueryResult<TenantPackage, Error> {
  return useQuery({
    queryKey: packageKeys.current(),
    queryFn: async () => {
      const data = await api.get('/packages/me');
      return data as TenantPackage;
    },
  });
}

/**
 * Fetch current tenant's package usage (GET /packages/me/usage)
 */
export function usePackageUsage(): UseQueryResult<PackageUsage, Error> {
  return useQuery({
    queryKey: packageKeys.usage(),
    queryFn: async () => {
      const data = await api.get('/packages/me/usage');
      return data as PackageUsage;
    },
  });
}

/**
 * Check if tenant can use a specific feature (GET /packages/me/can-use/:feature)
 */
export function useCanUseFeature(feature: string, enabled = true): UseQueryResult<{ canUse: boolean }, Error> {
  return useQuery({
    queryKey: packageKeys.canUse(feature),
    queryFn: async () => {
      const data = await api.get(`/packages/me/can-use/${feature}`);
      return data as { canUse: boolean };
    },
    enabled: enabled && !!feature,
  });
}

// ============================================================================
// ADMIN HOOKS (for PLATFORM_SUPERADMIN)
// ============================================================================

/**
 * Fetch all packages (admin) (GET /packages/admin/all)
 */
export function useAdminPackagesList(): UseQueryResult<Package[], Error> {
  return useQuery({
    queryKey: [...packageKeys.all, 'admin'],
    queryFn: async () => {
      const data = await api.get('/packages/admin/all');
      if (Array.isArray(data)) return data as Package[];
      return (data as any)?.data ?? [];
    },
  });
}

/**
 * Fetch single package by ID (admin)
 */
export function useAdminPackageDetail(id: string, enabled = true): UseQueryResult<Package, Error> {
  return useQuery({
    queryKey: packageKeys.detail(id),
    queryFn: async () => {
      const data = await api.get(`/packages/${id}`);
      return data as Package;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Admin: Create package (POST /packages)
 */
export function useCreatePackage(): UseMutationResult<Package, Error, CreatePackageDto> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async (dto: CreatePackageDto) => {
      const data = await api.post('/packages', dto);
      return data as Package;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
      showSuccessToast(`Package "${data.name}" created successfully!`);
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

/**
 * Admin: Update package (PATCH /packages/:id)
 */
export function useUpdatePackage(): UseMutationResult<
  Package,
  Error,
  { id: string; dto: UpdatePackageDto }
> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdatePackageDto }) => {
      const data = await api.patch(`/packages/${id}`, dto);
      return data as Package;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
      showSuccessToast(`Package "${data.name}" updated successfully!`);
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

/**
 * Admin: Delete package (DELETE /packages/:id)
 */
export function useDeletePackage(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async (packageId: string) => {
      await api.delete(`/packages/${packageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
      showSuccessToast('Package deleted successfully!');
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

/**
 * Admin: Assign package to tenant (POST /packages/:id/assign)
 */
export function useAssignPackageToTenant(): UseMutationResult<
  TenantPackage,
  Error,
  { packageId: string; dto: AssignPackageDto }
> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async ({ packageId, dto }: { packageId: string; dto: AssignPackageDto }) => {
      const data = await api.post(`/packages/${packageId}/assign`, dto);
      return data as TenantPackage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
      showSuccessToast('Package assigned to tenant successfully!');
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

/**
 * Tenant self-assign/upgrade package (POST /packages/:id/assign)
 * Note: backend currently guards this for platform admins; surface 403 clearly.
 */
export function useAssignPackageToSelf(): UseMutationResult<
  TenantPackage,
  Error,
  { packageId: string; tenantId: string; startTrial?: boolean }
> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async ({ packageId, tenantId, startTrial }: { packageId: string; tenantId: string; startTrial?: boolean }) => {
      if (!tenantId) {
        throw new Error('Missing tenant context for upgrade');
      }
      const data = await api.post(`/packages/${packageId}/assign`, { tenantId, startTrial });
      return data as TenantPackage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.current() });
      queryClient.invalidateQueries({ queryKey: packageKeys.usage() });
      showSuccessToast('Package updated successfully!');
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Combined hook for current package + usage
 * Useful for displaying package info with usage meters
 */
export function useCurrentPackageWithUsage() {
  const packageQuery = useCurrentPackage();
  const usageQuery = usePackageUsage();

  const tenantPackage = packageQuery.data as any;
  const packageDef = tenantPackage?.packageId || tenantPackage?.package;

  return {
    tenantPackage,
    package: packageDef as Package | undefined,
    usage: usageQuery.data,
    isLoading: packageQuery.isLoading || usageQuery.isLoading,
    isError: packageQuery.isError || usageQuery.isError,
    error: packageQuery.error || usageQuery.error,
  };
}

/**
 * Hook to check multiple features at once
 */
export function useFeatureFlags(features: string[]) {
  const queries = features.map((feature) =>
    useCanUseFeature(feature, true)
  );

  return {
    features: queries.reduce((acc, query, index) => {
      acc[features[index]] = query.data?.canUse || false;
      return acc;
    }, {} as Record<string, boolean>),
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
  };
}
