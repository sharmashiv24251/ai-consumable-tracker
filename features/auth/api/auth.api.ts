import { apiClient } from 'common/api';
import { MOCK_NETWORK_DELAY_MS } from 'src/config/mockConfig';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types';

/**
 * Mock login API
 * In production, this will call the real backend endpoint
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const mockResponse: AuthResponse = {
    success: true,
    token: `mock_token_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    user: {
      id: `user_${Date.now()}`,
      email: credentials.email,
      name: credentials.email.split('@')[0],
      avatar: null,
    },
  };

  const response = await apiClient.post<AuthResponse>(
    '/auth/login',
    credentials,
    mockResponse,
    MOCK_NETWORK_DELAY_MS
  );

  return response.data;
}

/**
 * Mock register API
 * In production, this will call the real backend endpoint
 */
export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const mockResponse: AuthResponse = {
    success: true,
    token: `mock_token_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    user: {
      id: `user_${Date.now()}`,
      email: credentials.email,
      name: credentials.name,
      avatar: null,
    },
  };

  const response = await apiClient.post<AuthResponse>(
    '/auth/register',
    credentials,
    mockResponse,
    MOCK_NETWORK_DELAY_MS
  );

  return response.data;
}

/**
 * Mock logout API
 * In production, this will invalidate the token on the backend
 */
export async function logout(): Promise<void> {
  await apiClient.post<{ success: boolean }>(
    '/auth/logout',
    {},
    { success: true },
    500 // Shorter delay for logout
  );
}

/**
 * Mock verify token API
 * In production, this will verify the token with the backend
 */
export async function verifyToken(token: string): Promise<{ valid: boolean; user?: User }> {
  // For mock purposes, all tokens are valid
  const mockResponse = {
    valid: true,
    user: {
      id: 'user_123',
      email: 'user@example.com',
      name: 'Mock User',
      avatar: null,
    },
  };

  const response = await apiClient.post<{ valid: boolean; user?: User }>(
    '/auth/verify',
    { token },
    mockResponse,
    500
  );

  return response.data;
}
