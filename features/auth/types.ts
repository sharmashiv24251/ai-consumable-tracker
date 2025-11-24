export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface AuthError {
  message: string;
  field?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  hasCompletedOnboarding: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (token: string, user: User) => Promise<void>;
  register: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  bypassLogin: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}
