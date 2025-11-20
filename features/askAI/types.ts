/**
 * AskAI Feature Types
 */

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  imageUri?: string | null;
  hadImage?: boolean;
  createdAt?: string;
}

export interface AIQueryPayload {
  message: string;
  imageUri?: string | null;
  conversationHistory?: AIMessage[];
}

export interface AIQueryResponse {
  reply: {
    id: string;
    text: string;
  };
}
