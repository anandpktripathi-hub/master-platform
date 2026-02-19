import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import api from '../services/api';
import { useApiErrorToast } from '../providers/QueryProvider';
import type {
  Coupon,
  CreateCouponDto,
  UpdateCouponDto,
  ValidateCouponDto,
  ValidateCouponResponse,
  ApplyCouponDto,
  CouponUsage,
  CouponStats,
} from '../types/api.types';

/**
 * Query keys for coupons
 */
export const couponKeys = {
  all: ['coupons'] as const,
  lists: () => [...couponKeys.all, 'list'] as const,
  list: (filters?: string) => [...couponKeys.lists(), filters] as const,
  details: () => [...couponKeys.all, 'detail'] as const,
  detail: (id: string) => [...couponKeys.details(), id] as const,
  stats: (id: string) => [...couponKeys.all, 'stats', id] as const,
  validate: (code: string, packageId: string) => [...couponKeys.all, 'validate', code, packageId] as const,
};

// ============================================================================
// TENANT HOOKS
// ============================================================================

/**
 * Validate coupon (POST /coupons/validate)
 * Checks if coupon is valid for the given package
 */
export function useValidateCoupon(): UseMutationResult<ValidateCouponResponse, Error, ValidateCouponDto> {
  const { showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async (dto: ValidateCouponDto) => {
      const data = await api.post('/coupons/validate', dto);
      return data as ValidateCouponResponse;
    },
    onError: (error: Error | { message?: string; response?: { data?: { message?: string } } }) => {
      showErrorToast(error);
    },
  });
}

/**
 * Apply coupon (POST /coupons/apply)
 * Records coupon usage and applies discount
 */
export function useApplyCoupon(): UseMutationResult<{ discount: number; couponId: string }, Error, ApplyCouponDto> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async (dto: ApplyCouponDto) => {
      const data = await api.post('/coupons/apply', dto);
      return data as { discount: number; couponId: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
      const discount = data.discount;
      showSuccessToast(`Coupon applied! Discount: $${discount.toFixed(2)}`);
    },
    onError: (error: Error | { message?: string; response?: { data?: { message?: string } } }) => {
      showErrorToast(error);
    },
  });
}

// ============================================================================
// ADMIN HOOKS (for PLATFORM_SUPERADMIN)
// ============================================================================

/**
 * Fetch all coupons (admin) (GET /coupons)
 */
export function useCouponsList(): UseQueryResult<Coupon[], Error> {
  return useQuery({
    queryKey: couponKeys.lists(),
    queryFn: async () => {
      const data = await api.get('/coupons');
      return data as Coupon[];
    },
  });
}

/**
 * Fetch single coupon by ID (admin)
 */
export function useCouponDetail(id: string, enabled = true): UseQueryResult<Coupon, Error> {
  return useQuery({
    queryKey: couponKeys.detail(id),
    queryFn: async () => {
      const data = await api.get(`/coupons/${id}`);
      return data as Coupon;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Fetch coupon usage statistics (admin) (GET /coupons/:id/usage)
 */
export function useCouponStats(id: string, enabled = true): UseQueryResult<CouponStats, Error> {
  return useQuery({
    queryKey: couponKeys.stats(id),
    queryFn: async () => {
      const data = await api.get(`/coupons/${id}/usage`);
      return data as CouponStats;
    },
    enabled: enabled && !!id,
  });
}

/**
 * Admin: Create coupon (POST /coupons)
 */
export function useCreateCoupon(): UseMutationResult<Coupon, Error, CreateCouponDto> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async (dto: CreateCouponDto) => {
      const data = await api.post('/coupons', dto);
      return data as Coupon;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      showSuccessToast(`Coupon "${data.code}" created successfully!`);
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

/**
 * Admin: Update coupon (PATCH /coupons/:id)
 */
export function useUpdateCoupon(): UseMutationResult<
  Coupon,
  Error,
  { id: string; dto: UpdateCouponDto }
> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateCouponDto }) => {
      const data = await api.patch(`/coupons/${id}`, dto);
      return data as Coupon;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
      showSuccessToast(`Coupon "${data.code}" updated successfully!`);
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

/**
 * Admin: Delete coupon (DELETE /coupons/:id)
 */
export function useDeleteCoupon(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async (couponId: string) => {
      await api.delete(`/coupons/${couponId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.lists() });
      showSuccessToast('Coupon deleted successfully!');
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

/**
 * Admin: Activate coupon (POST /coupons/:id/activate)
 */
export function useActivateCoupon(): UseMutationResult<Coupon, Error, string> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async (couponId: string) => {
      const data = await api.post(`/coupons/${couponId}/activate`);
      return data as Coupon;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
      showSuccessToast(`Coupon "${data.code}" activated!`);
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

/**
 * Admin: Deactivate coupon (POST /coupons/:id/deactivate)
 */
export function useDeactivateCoupon(): UseMutationResult<Coupon, Error, string> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async (couponId: string) => {
      const data = await api.post(`/coupons/${couponId}/deactivate`);
      return data as Coupon;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
      showSuccessToast(`Coupon "${data.code}" deactivated!`);
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

/**
 * Admin: Toggle coupon active status
 * Convenience wrapper around activate/deactivate
 */
export function useToggleCouponActive(): UseMutationResult<
  Coupon,
  Error,
  { id: string; activate: boolean }
> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async ({ id, activate }: { id: string; activate: boolean }) => {
      const endpoint = activate ? `/coupons/${id}/activate` : `/coupons/${id}/deactivate`;
      const data = await api.post(endpoint);
      return data as Coupon;
    },
    onSuccess: (data, { activate }) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
      const action = activate ? 'activated' : 'deactivated';
      showSuccessToast(`Coupon "${data.code}" ${action}!`);
    },
    onError: (error: any) => {
      showErrorToast(error);
    },
  });
}

/**
 * Admin: Bulk update coupon status (POST /coupons/bulk-actions/update-status)
 */
export function useBulkUpdateCouponStatus(): UseMutationResult<
  { updated: number },
  Error,
  { couponIds: string[]; status: 'active' | 'inactive' }
> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useApiErrorToast();

  return useMutation({
    mutationFn: async ({ couponIds, status }: { couponIds: string[]; status: 'active' | 'inactive' }) => {
      const data = await api.post('/coupons/bulk-actions/update-status', { couponIds, status });
      return data as { updated: number };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
      showSuccessToast(`${data.updated} coupon(s) updated successfully!`);
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
 * Combined hook for coupon with stats
 * Useful for displaying coupon detail page
 */
export function useCouponWithStats(id: string) {
  const couponQuery = useCouponDetail(id);
  const statsQuery = useCouponStats(id);

  return {
    coupon: couponQuery.data,
    stats: statsQuery.data,
    isLoading: couponQuery.isLoading || statsQuery.isLoading,
    isError: couponQuery.isError || statsQuery.isError,
    error: couponQuery.error || statsQuery.error,
  };
}
