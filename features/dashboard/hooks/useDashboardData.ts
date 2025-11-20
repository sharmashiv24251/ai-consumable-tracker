/**
 * Dashboard React Query Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../app/react-query/queryKeys';
import { fetchDashboardData } from '../api/dashboard.api';
import { useApp } from '../../../contexts/AppContext';

/**
 * Hook to fetch dashboard data
 * Returns scores and feed
 */
export function useDashboardData() {
  const { scores } = useApp();

  return useQuery({
    queryKey: queryKeys.dashboard.data(),
    queryFn: () => fetchDashboardData(scores),
    // Refetch when scores change
    enabled: true,
  });
}
