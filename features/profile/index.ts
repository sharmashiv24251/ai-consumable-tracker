/**
 * Profile Feature - Public API
 * Export screens, hooks, and types that can be used outside this feature
 */

// Screens
export { default as ProfileHome } from './screens/ProfileHome';
export { default as SettingsScreen } from './screens/SettingsScreen';

// Hooks
export { useProfile, useSettings, useUpdateSettings } from './hooks/useProfile';

// Types
export type { UserProfile, UserSettings } from './types';
