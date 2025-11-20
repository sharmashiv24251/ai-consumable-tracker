/**
 * Profile Feature Types
 */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  coins: number;
  joinedAt: string;
  avatar?: string;
}

export interface UserSettings {
  notifications: boolean;
  darkMode: boolean;
  language: string;
}
