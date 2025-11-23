/**
 * Scan History API
 * Mock endpoints for managing scan history
 */

import { apiClient } from '../../../common/api';
import { MOCK_NETWORK_DELAY_MS } from '../../../src/config/mockConfig';
import type { ScanHistoryItem, ScanResult } from '../types';

/**
 * Mock scan history data
 * Using random unsplash images for product photos
 */
const MOCK_SCAN_HISTORY: ScanHistoryItem[] = [
  {
    id: 'history_001',
    productName: 'Organic Almond Milk',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop',
    scannedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    scores: { health: 92, environment: 88 },
    result: {
      scanId: 'history_001',
      scores: { health: 92, environment: 88 },
      health: {
        good: [
          { id: 'h1', text: 'Organic certified ingredients' },
          { id: 'h2', text: 'High in calcium and vitamin E' },
          { id: 'h3', text: 'No added sugars' },
        ],
        ok: [{ id: 'h4', text: 'Slightly processed for shelf stability' }],
        bad: [],
      },
      environment: {
        good: [
          { id: 'e1', text: 'Recyclable packaging' },
          { id: 'e2', text: 'Sustainable almond farming practices' },
        ],
        ok: [{ id: 'e3', text: 'Water-intensive crop' }],
        bad: [],
      },
    },
  },
  {
    id: 'history_002',
    productName: 'Dark Chocolate Bar',
    imageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400&h=400&fit=crop',
    scannedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    scores: { health: 78, environment: 72 },
    result: {
      scanId: 'history_002',
      scores: { health: 78, environment: 72 },
      health: {
        good: [
          { id: 'h1', text: '70% cocoa content with antioxidants' },
          { id: 'h2', text: 'Natural ingredients only' },
        ],
        ok: [{ id: 'h3', text: 'Contains sugar and fats' }],
        bad: [{ id: 'h4', text: 'High calorie density' }],
      },
      environment: {
        good: [{ id: 'e1', text: 'Fair trade certified cocoa' }],
        ok: [{ id: 'e2', text: 'Imported from South America' }],
        bad: [{ id: 'e3', text: 'Foil wrapper not easily recyclable' }],
      },
    },
  },
  {
    id: 'history_003',
    productName: 'Greek Yogurt',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop',
    scannedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    scores: { health: 85, environment: 65 },
    result: {
      scanId: 'history_003',
      scores: { health: 85, environment: 65 },
      health: {
        good: [
          { id: 'h1', text: 'High in protein and probiotics' },
          { id: 'h2', text: 'Low in added sugars' },
          { id: 'h3', text: 'Rich in calcium' },
        ],
        ok: [],
        bad: [{ id: 'h4', text: 'Contains dairy - not suitable for lactose intolerant' }],
      },
      environment: {
        good: [{ id: 'e1', text: 'Locally sourced milk' }],
        ok: [{ id: 'e2', text: 'Plastic container is recyclable' }],
        bad: [{ id: 'e3', text: 'Dairy farming has environmental impact' }],
      },
    },
  },
  {
    id: 'history_004',
    productName: 'Quinoa Pasta',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=400&fit=crop',
    scannedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    scores: { health: 88, environment: 82 },
    result: {
      scanId: 'history_004',
      scores: { health: 88, environment: 82 },
      health: {
        good: [
          { id: 'h1', text: 'Gluten-free whole grain' },
          { id: 'h2', text: 'Complete protein with all amino acids' },
          { id: 'h3', text: 'High in fiber' },
        ],
        ok: [{ id: 'h4', text: 'Higher price than regular pasta' }],
        bad: [],
      },
      environment: {
        good: [
          { id: 'e1', text: 'Sustainable crop requiring less water' },
          { id: 'e2', text: 'Cardboard packaging fully recyclable' },
        ],
        ok: [],
        bad: [{ id: 'e3', text: 'Imported from Peru' }],
      },
    },
  },
  {
    id: 'history_005',
    productName: 'Coconut Water',
    imageUrl: 'https://images.unsplash.com/photo-1556024071-0caa28af3677?w=400&h=400&fit=crop',
    scannedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    scores: { health: 82, environment: 70 },
    result: {
      scanId: 'history_005',
      scores: { health: 82, environment: 70 },
      health: {
        good: [
          { id: 'h1', text: 'Natural electrolytes for hydration' },
          { id: 'h2', text: 'Low in calories' },
          { id: 'h3', text: 'No added sugars or preservatives' },
        ],
        ok: [{ id: 'h4', text: 'Contains natural sugars' }],
        bad: [],
      },
      environment: {
        good: [{ id: 'e1', text: 'Renewable resource' }],
        ok: [{ id: 'e2', text: 'Tetra pak partially recyclable' }],
        bad: [{ id: 'e3', text: 'Long-distance shipping from tropics' }],
      },
    },
  },
  {
    id: 'history_006',
    productName: 'Whole Wheat Bread',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
    scannedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    scores: { health: 75, environment: 68 },
    result: {
      scanId: 'history_006',
      scores: { health: 75, environment: 68 },
      health: {
        good: [
          { id: 'h1', text: 'Whole grain fiber content' },
          { id: 'h2', text: 'Good source of B vitamins' },
        ],
        ok: [{ id: 'h3', text: 'Contains some preservatives for freshness' }],
        bad: [{ id: 'h4', text: 'Moderate sodium content' }],
      },
      environment: {
        good: [{ id: 'e1', text: 'Locally baked' }],
        ok: [{ id: 'e2', text: 'Plastic bag packaging' }],
        bad: [{ id: 'e3', text: 'Wheat farming uses pesticides' }],
      },
    },
  },
  {
    id: 'history_007',
    productName: 'Green Tea',
    imageUrl: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop',
    scannedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    scores: { health: 95, environment: 85 },
    result: {
      scanId: 'history_007',
      scores: { health: 95, environment: 85 },
      health: {
        good: [
          { id: 'h1', text: 'Rich in antioxidants and polyphenols' },
          { id: 'h2', text: 'Supports metabolism and brain function' },
          { id: 'h3', text: 'Zero calories' },
          { id: 'h4', text: 'Organic certified' },
        ],
        ok: [],
        bad: [],
      },
      environment: {
        good: [
          { id: 'e1', text: 'Biodegradable tea bags' },
          { id: 'e2', text: 'Recyclable cardboard packaging' },
          { id: 'e3', text: 'Carbon-neutral shipping' },
        ],
        ok: [],
        bad: [],
      },
    },
  },
  {
    id: 'history_008',
    productName: 'Mixed Nuts Pack',
    imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=400&fit=crop',
    scannedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    scores: { health: 83, environment: 75 },
    result: {
      scanId: 'history_008',
      scores: { health: 83, environment: 75 },
      health: {
        good: [
          { id: 'h1', text: 'Healthy fats and protein' },
          { id: 'h2', text: 'No added salt or oil' },
          { id: 'h3', text: 'Rich in vitamins and minerals' },
        ],
        ok: [{ id: 'h4', text: 'High calorie density' }],
        bad: [{ id: 'h5', text: 'May contain allergens' }],
      },
      environment: {
        good: [{ id: 'e1', text: 'Minimal processing' }],
        ok: [{ id: 'e2', text: 'Plastic bag packaging' }],
        bad: [{ id: 'e3', text: 'Some nuts imported globally' }],
      },
    },
  },
];

/**
 * Fetch scan history for a user
 * In real implementation, this would be GET /api/scan/history?userId={userId}&limit={limit}
 */
export async function fetchScanHistory(
  userId: string,
  limit?: number
): Promise<ScanHistoryItem[]> {
  console.log(`[Scan History API] Fetching history for user ${userId}...`);

  const history = limit ? MOCK_SCAN_HISTORY.slice(0, limit) : MOCK_SCAN_HISTORY;

  const response = await apiClient.get<ScanHistoryItem[]>(
    `/scan/history?userId=${userId}${limit ? `&limit=${limit}` : ''}`,
    history,
    MOCK_NETWORK_DELAY_MS
  );

  return response.data;
}

/**
 * Fetch a single scan by ID
 * In real implementation, this would be GET /api/scan/{scanId}
 */
export async function fetchScanById(scanId: string): Promise<ScanHistoryItem | null> {
  console.log(`[Scan History API] Fetching scan ${scanId}...`);

  const scan = MOCK_SCAN_HISTORY.find((item) => item.id === scanId);

  if (!scan) {
    throw new Error(`Scan ${scanId} not found`);
  }

  const response = await apiClient.get<ScanHistoryItem>(
    `/scan/${scanId}`,
    scan,
    MOCK_NETWORK_DELAY_MS
  );

  return response.data;
}
