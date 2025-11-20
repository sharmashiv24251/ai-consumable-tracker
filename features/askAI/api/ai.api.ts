/**
 * AskAI API
 * Mock endpoints for AI conversation
 */

import { apiClient } from '../../../common/api';
import { MOCK_NETWORK_DELAY_MS } from '../../../src/config/mockConfig';
import type { AIQueryPayload, AIQueryResponse } from '../types';

/**
 * Mock AI responses - rotated based on query
 * These simulate Nubo's personality and helpful responses
 */
const MOCK_AI_RESPONSES = [
  "Hey there! Based on what I see, this product looks pretty solid. The ingredients are mostly natural, which is great for your health. The packaging could be better for the environment, but overall it's a decent choice. Want to know more about specific ingredients?",

  "Good question! For healthier alternatives, I'd suggest looking for products with organic certification and minimal packaging. Local farmer's markets often have great options that are both healthier and more eco-friendly. Plus, they're usually fresher too!",

  "That's actually a smart observation! Yes, glass packaging is generally better for the environment than plastic because it's infinitely recyclable. However, it does have a higher carbon footprint during production and transportation due to weight. It's all about trade-offs!",

  "I can help with that! To make more sustainable choices, look for: 1) Minimal packaging, 2) Local or regional products, 3) Organic certifications, 4) Fair trade labels, and 5) Seasonal items. These small changes add up to make a big impact!",

  "Great catch! That ingredient is generally safe but some people might be sensitive to it. If you have specific allergies or dietary restrictions, I'd recommend checking with your doctor. Want me to suggest some allergen-free alternatives?",

  "You're on the right track! Switching to reusable options is one of the best things you can do. For water bottles, look for stainless steel or BPA-free options. They keep drinks cold longer and reduce plastic waste significantly. Your planet score will thank you!",

  "That's a common concern! While organic products can be pricier, they often have better nutritional value and fewer pesticides. If budget's tight, prioritize organic for items where you eat the skin (like apples, berries) and go conventional for others (like bananas, avocados).",

  "Interesting question! The 'natural' label isn't always regulated, so it can be misleading. Look for specific certifications like USDA Organic, Non-GMO Project, or specific ingredient lists instead. Real natural products should have ingredients you recognize!",
];

/**
 * Send a query to the AI and get a response
 * In real implementation, this would be POST /api/ai/query
 */
export async function queryAI(payload: AIQueryPayload): Promise<AIQueryResponse> {
  console.log('[AI API] Processing query:', payload.message);

  // Select response based on message content or rotate through
  let responseText: string;

  // Simple keyword matching for more relevant responses
  const msg = payload.message.toLowerCase();
  if (msg.includes('health') || msg.includes('ingredient')) {
    responseText = MOCK_AI_RESPONSES[0];
  } else if (msg.includes('alternative') || msg.includes('better')) {
    responseText = MOCK_AI_RESPONSES[1];
  } else if (msg.includes('package') || msg.includes('packaging')) {
    responseText = MOCK_AI_RESPONSES[2];
  } else if (msg.includes('eco') || msg.includes('environment') || msg.includes('sustainable')) {
    responseText = MOCK_AI_RESPONSES[3];
  } else if (msg.includes('allerg') || msg.includes('safe')) {
    responseText = MOCK_AI_RESPONSES[4];
  } else if (msg.includes('reusable') || msg.includes('bottle')) {
    responseText = MOCK_AI_RESPONSES[5];
  } else if (msg.includes('organic') || msg.includes('price') || msg.includes('budget')) {
    responseText = MOCK_AI_RESPONSES[6];
  } else if (msg.includes('natural')) {
    responseText = MOCK_AI_RESPONSES[7];
  } else {
    // Default rotation
    const index = Math.floor(Math.random() * MOCK_AI_RESPONSES.length);
    responseText = MOCK_AI_RESPONSES[index];
  }

  const response: AIQueryResponse = {
    reply: {
      id: `ai_${Date.now()}`,
      text: responseText,
    },
  };

  const result = await apiClient.post<AIQueryResponse>('/ai/query', payload, response);

  return result.data;
}
