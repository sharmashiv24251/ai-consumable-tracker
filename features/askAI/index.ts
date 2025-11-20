/**
 * AskAI Feature - Public API
 * Export screens, hooks, and types that can be used outside this feature
 */

// Screens
export { default as ChatWithAI } from './screens/ChatWithAI';

// Hooks
export { useAIQuery } from './hooks/useAIQuery';

// Types
export type { AIMessage, AIQueryPayload, AIQueryResponse } from './types';
