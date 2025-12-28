import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions, QueryKey } from '@tanstack/react-query';

interface UsePollingQueryOptions<TData> extends Omit<UseQueryOptions<TData, Error, TData, QueryKey>, 'queryKey' | 'queryFn'> {
  enabled?: boolean;
  refetchInterval?: number | false | ((data: TData | undefined) => number | false);
}

export function usePollingQuery<TData>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options: UsePollingQueryOptions<TData> = {}
) {
  const { enabled = true, refetchInterval = false, ...rest } = options;

  return useQuery<TData, Error>({
    queryKey,
    queryFn,
    enabled,
    refetchInterval,
    ...rest,
  });
}

export default usePollingQuery;
