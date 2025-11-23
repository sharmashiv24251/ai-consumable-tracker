/**
 * Scan Feature Types
 */

export interface ScanPoint {
  id: string;
  text: string;
}

export interface ScanCategory {
  good: ScanPoint[];
  ok: ScanPoint[];
  bad: ScanPoint[];
}

export interface ScanScores {
  health: number; // 0-100
  environment: number; // 0-100
}

/**
 * Exact scan API response shape as per spec
 */
export interface ScanResult {
  health: ScanCategory;
  environment: ScanCategory;
  scores: ScanScores;
  scanId: string;
}

/**
 * Upload request payload
 */
export interface ScanUploadPayload {
  imageUri: string;
  productName?: string;
}

/**
 * Extended scan result for local storage (backward compatible)
 */
export interface LocalScanResult {
  id: string;
  productName: string;
  healthScore: number;
  planetScore: number;
  goodPoints: string[];
  okayPoints: string[];
  badPoints: string[];
  timestamp: number;
  imageUri?: string;
}

/**
 * Scan history item for profile/history display
 */
export interface ScanHistoryItem {
  id: string;
  productName: string;
  imageUrl: string;
  scannedAt: string; // ISO date string
  scores: ScanScores;
  result: ScanResult; // Full scan result for navigation to details
}
