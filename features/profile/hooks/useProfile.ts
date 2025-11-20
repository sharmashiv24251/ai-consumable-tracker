/**
 * Profile React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../app/react-query/queryKeys';
import { fetchProfile, fetchSettings, updateSettings } from '../api/profile.api';
import type { UserSettings } from '../types';

/**
 * Hook to fetch user profile
 */
export function useProfile(userId: string) {
  return useQuery({
    queryKey: queryKeys.profile.user(userId),
    queryFn: () => fetchProfile(userId),
    enabled: !!userId,
  });
}

/**
 * Hook to fetch user settings
 */
export function useSettings(userId: string) {
  return useQuery({
    queryKey: queryKeys.profile.settings(userId),
    queryFn: () => fetchSettings(userId),
    enabled: !!userId,
  });
}

/**
 * Hook to update user settings
 */
export function useUpdateSettings(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<UserSettings>) => updateSettings(userId, settings),

    onSuccess: () => {
      // Invalidate settings query to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.profile.settings(userId),
      });
    },

    onError: (error: Error) => {
      console.error('[useUpdateSettings] Failed to update settings:', error);
    },
  });
}
