import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { authStorage } from '../storage';
import type { AuthState, User } from '../types';

const defaultState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  hasCompletedOnboarding: false,
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [state, setState] = useState<AuthState>(defaultState);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const [token, user, hasCompletedOnboarding] = await Promise.all([
        authStorage.getToken(),
        authStorage.getUser(),
        authStorage.getHasCompletedOnboarding(),
      ]);

      // If we have a token and user, consider the user authenticated
      // In production, you'd verify the token with the backend here
      const isAuthenticated = !!token && !!user;

      setState({
        isAuthenticated,
        isLoading: false,
        user: user || null,
        hasCompletedOnboarding,
      });
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        hasCompletedOnboarding: false,
      });
    }
  }, []);

  const login = useCallback(async (token: string, user: User) => {
    try {
      await Promise.all([authStorage.setToken(token), authStorage.setUser(user)]);

      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        user,
      }));
    } catch (error) {
      console.error('Failed to login:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (token: string, user: User) => {
    try {
      await Promise.all([authStorage.setToken(token), authStorage.setUser(user)]);

      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        user,
      }));
    } catch (error) {
      console.error('Failed to register:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Clear all storage (token + user + onboarding flag)
      await authStorage.clearAll();

      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        hasCompletedOnboarding: false, // Reset onboarding on logout
      });
    } catch (error) {
      console.error('Failed to logout:', error);
      throw error;
    }
  }, []);

  const bypassLogin = useCallback(async () => {
    try {
      const mockUser: User = {
        id: 'dev-user',
        email: 'dev@example.com',
        name: 'Development User',
        avatar: null,
      };

      const mockToken = `mock_token_dev_${Date.now()}`;

      await Promise.all([
        authStorage.setToken(mockToken),
        authStorage.setUser(mockUser),
      ]);

      setState((prev) => ({
        ...prev,
        isAuthenticated: true,
        user: mockUser,
      }));
    } catch (error) {
      console.error('Failed to bypass login:', error);
      throw error;
    }
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      await authStorage.setHasCompletedOnboarding();
      setState((prev) => ({
        ...prev,
        hasCompletedOnboarding: true,
      }));
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      throw error;
    }
  }, []);

  return useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      bypassLogin,
      completeOnboarding,
      initializeAuth,
    }),
    [state, login, register, logout, bypassLogin, completeOnboarding, initializeAuth]
  );
});
