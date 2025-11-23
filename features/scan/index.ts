/**
 * Scan Feature - Public API
 * Export screens, hooks, and types that can be used outside this feature
 */

// Screens
export { default as ScanScreen } from './screens/ScanScreen';

// Components
export { default as ScanHistoryItem } from './components/ScanHistoryItem';

// Hooks
export { useUploadScan } from './hooks/useUploadScan';
export { useScanHistory } from './hooks/useScanHistory';

// Types
export type {
  ScanResult,
  ScanUploadPayload,
  ScanScores,
  ScanCategory,
  ScanHistoryItem as ScanHistoryItemType,
} from './types';
