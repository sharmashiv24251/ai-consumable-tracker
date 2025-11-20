/**
 * Mock API Configuration
 * Controls network simulation behavior for mock APIs
 */

export const MOCK_NETWORK_DELAY_MS = 1500; // Simulated network latency
export const MOCK_PROCESSING_DELAY_MS = 2000; // Extra delay for "processing" operations like scan

export const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API !== 'false'; // Default to true for now
