import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User } from './types';

const KEYS = {
  AUTH_TOKEN: '@auth_token',
  AUTH_USER: '@auth_user',
  HAS_COMPLETED_ONBOARDING: '@has_completed_onboarding',
};

export const authStorage = {
  // Token operations
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error('Failed to set token:', error);
    }
  },

  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  },

  // User operations
  async getUser(): Promise<User | null> {
    try {
      const user = await AsyncStorage.getItem(KEYS.AUTH_USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Failed to get user:', error);
      return null;
    }
  },

  async setUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.AUTH_USER, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to set user:', error);
    }
  },

  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.AUTH_USER);
    } catch (error) {
      console.error('Failed to remove user:', error);
    }
  },

  // Onboarding flag
  async getHasCompletedOnboarding(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(KEYS.HAS_COMPLETED_ONBOARDING);
      return value === 'true';
    } catch (error) {
      console.error('Failed to get onboarding status:', error);
      return false;
    }
  },

  async setHasCompletedOnboarding(): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.HAS_COMPLETED_ONBOARDING, 'true');
    } catch (error) {
      console.error('Failed to set onboarding status:', error);
    }
  },

  async removeOnboardingFlag(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.HAS_COMPLETED_ONBOARDING);
    } catch (error) {
      console.error('Failed to remove onboarding flag:', error);
    }
  },

  // Clear all auth data (for logout)
  async clearAll(): Promise<void> {
    try {
      await Promise.all([
        this.removeToken(),
        this.removeUser(),
        this.removeOnboardingFlag(),
      ]);
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  },
};
