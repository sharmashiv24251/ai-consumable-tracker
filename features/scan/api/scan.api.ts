/**
 * Scan API
 * Mock endpoints for product scanning
 */

import { apiClient } from '../../../common/api';
import {
  MOCK_NETWORK_DELAY_MS,
  MOCK_PROCESSING_DELAY_MS,
} from '../../../src/config/mockConfig';
import type { ScanResult, ScanUploadPayload } from '../types';

/**
 * Mock scan responses for GENERAL mode
 * These represent AI-analyzed product images
 */
const MOCK_GENERAL_RESPONSES: Omit<ScanResult, 'scanId' | 'mode' | 'barcodeData'>[] = [
  {
    scores: {
      health: 85,
      environment: 72,
    },
    health: {
      good: [
        { id: 'h_g_1', text: 'Natural ingredients with minimal processing' },
        { id: 'h_g_2', text: 'No artificial preservatives or colors' },
        { id: 'h_g_3', text: 'Rich in essential vitamins and minerals' },
      ],
      ok: [
        { id: 'h_o_1', text: 'Contains moderate sodium levels' },
        { id: 'h_o_2', text: 'Some added sugars for flavor' },
      ],
      bad: [{ id: 'h_b_1', text: 'May contain traces of allergens' }],
    },
    environment: {
      good: [
        { id: 'e_g_1', text: 'Recyclable packaging materials' },
        { id: 'e_g_2', text: 'Locally sourced ingredients reduce carbon footprint' },
      ],
      ok: [
        { id: 'e_o_1', text: 'Mixed material packaging requires separation' },
        { id: 'e_o_2', text: 'Standard supply chain with moderate emissions' },
      ],
      bad: [
        { id: 'e_b_1', text: 'Contains single-use plastic components' },
        { id: 'e_b_2', text: 'Non-biodegradable wrapper' },
      ],
    },
  },
  {
    scores: {
      health: 65,
      environment: 58,
    },
    health: {
      good: [
        { id: 'h_g_1', text: 'Contains essential nutrients' },
        { id: 'h_g_2', text: 'Fortified with vitamins' },
      ],
      ok: [
        { id: 'h_o_1', text: 'Processed ingredients with preservatives' },
        { id: 'h_o_2', text: 'Moderate calorie content' },
      ],
      bad: [
        { id: 'h_b_1', text: 'High in saturated fats' },
        { id: 'h_b_2', text: 'Contains artificial flavoring' },
        { id: 'h_b_3', text: 'Elevated sodium levels' },
      ],
    },
    environment: {
      good: [{ id: 'e_g_1', text: 'Recyclable outer packaging' }],
      ok: [{ id: 'e_o_1', text: 'Standard manufacturing processes' }],
      bad: [
        { id: 'e_b_1', text: 'Heavy plastic packaging' },
        { id: 'e_b_2', text: 'Individual portions create excess waste' },
        { id: 'e_b_3', text: 'Long-distance shipping increases carbon footprint' },
      ],
    },
  },
];

/**
 * Mock scan responses for BARCODE mode
 * These represent barcode database lookups
 */
const MOCK_BARCODE_RESPONSES: Omit<ScanResult, 'scanId' | 'mode' | 'barcodeData'>[] = [
  {
    scores: {
      health: 92,
      environment: 88,
    },
    health: {
      good: [
        { id: 'h_g_1', text: 'Organic certified ingredients' },
        { id: 'h_g_2', text: 'High in antioxidants and fiber' },
        { id: 'h_g_3', text: 'No added sugars or artificial sweeteners' },
        { id: 'h_g_4', text: 'Gluten-free and allergen-friendly' },
      ],
      ok: [{ id: 'h_o_1', text: 'Higher price point than conventional alternatives' }],
      bad: [],
    },
    environment: {
      good: [
        { id: 'e_g_1', text: 'Fully compostable packaging' },
        { id: 'e_g_2', text: 'Carbon-neutral production process' },
        { id: 'e_g_3', text: 'Fair trade certified supply chain' },
      ],
      ok: [{ id: 'e_o_1', text: 'Imported from distant region' }],
      bad: [],
    },
  },
  {
    scores: {
      health: 70,
      environment: 65,
    },
    health: {
      good: [
        { id: 'h_g_1', text: 'Contains whole grains' },
        { id: 'h_g_2', text: 'Good source of fiber' },
      ],
      ok: [
        { id: 'h_o_1', text: 'Moderate sugar content' },
        { id: 'h_o_2', text: 'Contains some preservatives' },
      ],
      bad: [{ id: 'h_b_1', text: 'High sodium levels' }],
    },
    environment: {
      good: [{ id: 'e_g_1', text: 'Recyclable cardboard box' }],
      ok: [
        { id: 'e_o_1', text: 'Standard manufacturing process' },
        { id: 'e_o_2', text: 'Regional distribution' },
      ],
      bad: [{ id: 'e_b_1', text: 'Plastic inner bag not recyclable' }],
    },
  },
];

/**
 * Upload scan image and get analysis
 * In real implementation, this would be POST /api/scan/upload
 * @param payload - Image data and optional product name
 */
export async function uploadScan(payload: ScanUploadPayload): Promise<ScanResult> {
  const mode = payload.mode || 'general';
  const barcodeData = payload.barcodeData || null;

  console.log('[Scan API] Uploading image for analysis...', {
    mode,
    barcodeData,
  });

  // Select mock response based on mode
  const mockResponses = mode === 'barcode' ? MOCK_BARCODE_RESPONSES : MOCK_GENERAL_RESPONSES;
  const mockResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

  // Generate unique scan ID and use real mode and barcode data from payload
  const scanResult: ScanResult = {
    ...mockResponse,
    scanId: `scan_${Date.now()}`,
    mode, // Use actual mode from frontend
    barcodeData, // Use actual barcode data from frontend (if barcode mode)
  };

  // Simulate network + processing delay
  const totalDelay = MOCK_NETWORK_DELAY_MS + MOCK_PROCESSING_DELAY_MS;

  const response = await apiClient.upload<ScanResult>(
    '/scan/upload',
    payload,
    scanResult,
    totalDelay
  );

  return response.data;
}
