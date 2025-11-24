import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logout as logoutApi } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';

export function useLogout() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: async () => {
      // Clear auth state (token + user + onboarding flag)
      await logout();

      // Clear all React Query cache
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout failed:', error);
    },
  });
}
