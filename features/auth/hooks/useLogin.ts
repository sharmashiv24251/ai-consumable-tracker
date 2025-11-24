import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'app/react-query/queryKeys';
import { login as loginApi } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import type { LoginCredentials } from '../types';

export function useLogin() {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginApi(credentials),
    onSuccess: async (data) => {
      // Update auth context with token and user
      await login(data.token, data.user);

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
}
