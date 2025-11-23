/**
 * Trends API
 * Mock endpoints for dashboard trends data
 */

import { apiClient } from '../../../common/api';
import { MOCK_NETWORK_DELAY_MS } from '../../../src/config/mockConfig';
import type { TrendsData } from '../types';

/**
 * Mock trends data
 * This represents what the real API will return
 * Data shows realistic wave patterns for health and environment scores over 6 months
 */
const MOCK_TRENDS_DATA: TrendsData = {
  dataPoints: [
    {
      month: 'Jan',
      healthScore: 45,
      environmentScore: 55,
    },
    {
      month: 'Feb',
      healthScore: 68,
      environmentScore: 72,
    },
    {
      month: 'Mar',
      healthScore: 52,
      environmentScore: 62,
    },
    {
      month: 'Apr',
      healthScore: 72,
      environmentScore: 48,
    },
    {
      month: 'May',
      healthScore: 58,
      environmentScore: 82,
    },
    {
      month: 'Jun',
      healthScore: 78,
      environmentScore: 68,
    },
  ],
  percentageChange: 20,
  period: 'last week',
};

/**
 * Fetch trends data
 * In real implementation, this would be GET /api/dashboard/trends
 */
export async function fetchTrendsData(): Promise<TrendsData> {
  const response = await apiClient.get<TrendsData>(
    '/dashboard/trends',
    MOCK_TRENDS_DATA,
    MOCK_NETWORK_DELAY_MS
  );

  return response.data;
}
