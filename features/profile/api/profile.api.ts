/**
 * Profile API
 * Mock endpoints for user profile data
 */

import { apiClient } from '../../../common/api';
import { MOCK_NETWORK_DELAY_MS } from '../../../src/config/mockConfig';
import type { UserProfile, UserSettings } from '../types';

/**
 * Mock user profile data
 */
const MOCK_USER_PROFILE: UserProfile = {
  id: 'user_123',
  name: 'Alex Green',
  email: 'alex.green@example.com',
  coins: 245,
  joinedAt: new Date('2024-01-15').toISOString(),
  avatar: 'https://i.pravatar.cc/150?img=12',
};

/**
 * Mock user settings
 */
const MOCK_USER_SETTINGS: UserSettings = {
  notifications: true,
  darkMode: false,
  language: 'en',
};

/**
 * Fetch user profile by ID
 * In real implementation, this would be GET /api/profile/:userId
 */
export async function fetchProfile(userId: string): Promise<UserProfile> {
  console.log('[Profile API] Fetching profile for user:', userId);

  const response = await apiClient.get<UserProfile>(
    `/profile/${userId}`,
    MOCK_USER_PROFILE,
    MOCK_NETWORK_DELAY_MS
  );

  return response.data;
}

/**
 * Fetch user settings
 * In real implementation, this would be GET /api/profile/:userId/settings
 */
export async function fetchSettings(userId: string): Promise<UserSettings> {
  console.log('[Profile API] Fetching settings for user:', userId);

  const response = await apiClient.get<UserSettings>(
    `/profile/${userId}/settings`,
    MOCK_USER_SETTINGS,
    MOCK_NETWORK_DELAY_MS
  );

  return response.data;
}

/**
 * Update user settings
 * In real implementation, this would be PUT /api/profile/:userId/settings
 */
export async function updateSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<UserSettings> {
  console.log('[Profile API] Updating settings for user:', userId, settings);

  const updatedSettings: UserSettings = {
    ...MOCK_USER_SETTINGS,
    ...settings,
  };

  const response = await apiClient.put<UserSettings>(
    `/profile/${userId}/settings`,
    settings,
    updatedSettings,
    MOCK_NETWORK_DELAY_MS
  );

  return response.data;
}
