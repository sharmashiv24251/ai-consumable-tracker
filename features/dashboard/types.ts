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
