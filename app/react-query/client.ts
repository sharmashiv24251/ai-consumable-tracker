/**
 * React Query Client Configuration
 *
 * Configures global defaults for queries and mutations
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: how long data is considered fresh
      staleTime: 1000 * 60 * 5, // 5 minutes

      // Cache time: how long unused data stays in cache
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)

      // Retry failed requests
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus (useful for web, less so for mobile)
      refetchOnWindowFocus: false,

      // Refetch on reconnect
      refetchOnReconnect: true,

      // Refetch on mount if stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations on failure
      retry: 1,
      retryDelay: 1000,
    },
  },
});
