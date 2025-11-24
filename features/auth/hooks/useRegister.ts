import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'app/react-query/queryKeys';
import { register as registerApi } from '../api/auth.api';
import { useAuth } from '../context/AuthContext';
import type { RegisterCredentials } from '../types';

export function useRegister() {
  const { register } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => registerApi(credentials),
    onSuccess: async (data) => {
      // Update auth context with token and user
      await register(data.token, data.user);

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all });
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });
}
