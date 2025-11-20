/**
 * API Client Entry Point
 *
 * This file provides a single import point for API calls.
 * It can be switched between mock and real client based on configuration.
 *
 * Usage in features:
 * import { apiClient } from 'common/api';
 * const response = await apiClient.get('/endpoint', mockData);
 */

import { USE_MOCK_API } from '../../src/config/mockConfig';
import { mockClient } from './mockClient';

// In the future, you can create a real client:
// import { realClient } from './realClient';

/**
 * Conditionally export the mock or real API client
 * For now, we only have mockClient
 */
export const apiClient = USE_MOCK_API ? mockClient : mockClient; // TODO: Replace second mockClient with realClient when ready

// Re-export types
export type { MockResponse } from './mockClient';
