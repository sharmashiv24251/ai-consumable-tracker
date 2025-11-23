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
    trends: () => [...queryKeys.dashboard.all, 'trends'] as const,
  },

  // Scan feature keys
  scan: {
    all: ['scan'] as const,
    history: (userId: string, limit?: number) =>
      [...queryKeys.scan.all, 'history', userId, limit] as const,
    allHistory: (userId: string) => [...queryKeys.scan.all, 'history', userId, 'all'] as const,
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
