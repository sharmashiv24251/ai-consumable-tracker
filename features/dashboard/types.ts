/**
 * Dashboard Feature Types
 */

export interface DashboardScores {
  health: number; // 0-100
  environment: number; // 0-100
}

export interface FeedItem {
  id: string;
  user: {
    id: string;
    name: string;
  };
  action: string;
  coins: number;
  createdAt: string;
}

export interface DashboardData {
  scores: DashboardScores;
  feed: FeedItem[];
}

export interface TrendDataPoint {
  month: string; // e.g., "Jan", "Feb", "Mar"
  healthScore: number; // 0-100
  environmentScore: number; // 0-100
}

export interface TrendsData {
  dataPoints: TrendDataPoint[];
  percentageChange: number; // e.g., 20 for +20%
  period: string; // e.g., "last week", "last month"
}

export type TrendFilter = 'all' | 'health' | 'environment';
