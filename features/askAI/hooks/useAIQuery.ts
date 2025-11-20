/**
 * AskAI React Query Hooks
 */

import { useMutation } from '@tanstack/react-query';
import { queryAI } from '../api/ai.api';
import type { AIQueryPayload, AIQueryResponse } from '../types';

/**
 * Hook to send a query to the AI
 * Returns mutation with isLoading, error, and data states
 */
export function useAIQuery() {
  return useMutation({
    mutationFn: (payload: AIQueryPayload) => queryAI(payload),

    onSuccess: (data: AIQueryResponse) => {
      console.log('[useAIQuery] AI response received:', data.reply.id);
    },

    onError: (error: Error) => {
      console.error('[useAIQuery] AI query failed:', error);
    },
  });
}
