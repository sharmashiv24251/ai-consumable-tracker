/**
 * Dashboard Feature - Public API
 * Export screens, hooks, and types that can be used outside this feature
 */

// Screens
export { default as DashboardHome } from './screens/DashboardHome';

// Components
export { default as TrendsChart } from './components/TrendsChart';

// Hooks
export { useDashboardData } from './hooks/useDashboardData';
export { useTrendsData } from './hooks/useTrendsData';

// Types
export type {
  DashboardData,
  DashboardScores,
  FeedItem,
  TrendsData,
  TrendDataPoint,
  TrendFilter,
} from './types';
