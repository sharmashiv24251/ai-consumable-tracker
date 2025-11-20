/**
 * Centralized Query Key Factories
 *
 * Following best practices from TanStack Query docs:
 * https://tanstack.com/query/latest/docs/react/guides/query-keys
 *
 * Each feature has its own key factory to ensure consistent cache keys
 */

export const queryKeys = {
  // Dashboard feature keys
  dashboard: {
    all: ['dashboard'] as const,
    data: () => [...queryKeys.dashboard.all, 'data'] as const,
    feed: (userId?: string) => [...queryKeys.dashboard.all, 'feed', userId] as const,
  },

  // Scan feature keys
  scan: {
    all: ['scan'] as const,
    history: () => [...queryKeys.scan.all, 'history'] as const,
    result: (scanId: string) => [...queryKeys.scan.all, 'result', scanId] as const,
  },

  // AI/Chat feature keys
  ai: {
    all: ['ai'] as const,
    conversation: (conversationId: string) =>
      [...queryKeys.ai.all, 'conversation', conversationId] as const,
    messages: (conversationId: string) =>
      [...queryKeys.ai.all, 'messages', conversationId] as const,
  },

  // Profile feature keys
  profile: {
    all: ['profile'] as const,
    user: (userId: string) => [...queryKeys.profile.all, 'user', userId] as const,
    settings: (userId: string) => [...queryKeys.profile.all, 'settings', userId] as const,
  },
};
