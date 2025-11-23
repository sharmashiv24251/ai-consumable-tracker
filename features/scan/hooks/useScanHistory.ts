/**
 * Scan History React Query Hook
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../app/react-query/queryKeys';
import { fetchScanHistory } from '../api/scanHistory.api';

/**
 * Hook to fetch scan history for a user
 * @param userId - User ID to fetch history for
 * @param limit - Optional limit on number of results
 */
export function useScanHistory(userId: string, limit?: number) {
  return useQuery({
    queryKey: limit ? queryKeys.scan.history(userId, limit) : queryKeys.scan.allHistory(userId),
    queryFn: () => fetchScanHistory(userId, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
