/**
 * Trends React Query Hook
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../app/react-query/queryKeys';
import { fetchTrendsData } from '../api/trends.api';

/**
 * Hook to fetch trends data
 * Returns data points for health and environment scores over time
 */
export function useTrendsData() {
  return useQuery({
    queryKey: queryKeys.dashboard.trends(),
    queryFn: fetchTrendsData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
