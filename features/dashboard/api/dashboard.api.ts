/**
 * Dashboard API
 * Mock endpoints for dashboard data
 */

import { apiClient } from '../../../common/api';
import { MOCK_NETWORK_DELAY_MS } from '../../../src/config/mockConfig';
import type { DashboardData } from '../types';

/**
 * Mock dashboard data
 * This represents what the real API will return
 */
const MOCK_DASHBOARD_DATA: DashboardData = {
  scores: {
    health: 0, // Will be updated from scan history
    environment: 0, // Will be updated from scan history
  },
  feed: [
    {
      id: '1',
      user: { id: 'u1', name: 'Aria' },
      action: 'Planted a tree',
      coins: 20,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      user: { id: 'u2', name: 'Leo' },
      action: 'Chose reusable packaging',
      coins: 15,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      user: { id: 'u3', name: 'Maya' },
      action: 'Scanned organic product',
      coins: 10,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ],
};

/**
 * Fetch dashboard data (scores + feed)
 * In real implementation, this would be GET /api/dashboard
 */
export async function fetchDashboardData(
  scores?: { health: number; planet: number }
): Promise<DashboardData> {
  // Use provided scores or defaults
  const dashboardData: DashboardData = {
    ...MOCK_DASHBOARD_DATA,
    scores: {
      health: scores?.health ?? 0,
      environment: scores?.planet ?? 0,
    },
  };

  const response = await apiClient.get<DashboardData>(
    '/dashboard',
    dashboardData,
    MOCK_NETWORK_DELAY_MS
  );

  return response.data;
}
