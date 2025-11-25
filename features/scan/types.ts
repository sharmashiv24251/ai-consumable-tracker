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
  mode: 'general' | 'barcode';
  barcodeData?: string | null;
}

/**
 * Upload request payload
 */
export interface ScanUploadPayload {
  imageUri: string;
  productName?: string;
  mode?: 'general' | 'barcode';
  barcodeData?: string | null;
}

/**
 * Category points structure for UI display
 */
export interface CategoryPoints {
  good: string[];
  okay: string[];
  bad: string[];
}

/**
 * Extended scan result for local storage
 */
export interface LocalScanResult {
  id: string;
  productName: string;
  healthScore: number;
  planetScore: number;
  health: CategoryPoints;
  environment: CategoryPoints;
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
