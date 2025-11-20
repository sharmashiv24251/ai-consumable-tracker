/**
 * Mock API Client
 * Simulates network requests with setTimeout delays
 * All methods return promises that resolve after MOCK_NETWORK_DELAY_MS
 */

import { MOCK_NETWORK_DELAY_MS } from '../../src/config/mockConfig';

export interface MockResponse<T = any> {
  data: T;
  status: number;
}

class MockClient {
  private delay(ms: number = MOCK_NETWORK_DELAY_MS): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Mock GET request
   * @param path - API endpoint path (for logging/debugging)
   * @param mockResponse - The mock data to return
   * @param customDelay - Optional custom delay override
   */
  async get<T>(path: string, mockResponse: T, customDelay?: number): Promise<MockResponse<T>> {
    console.log(`[MockClient] GET ${path}`);
    await this.delay(customDelay);
    console.log(`[MockClient] GET ${path} - Resolved`);
    return {
      data: mockResponse,
      status: 200,
    };
  }

  /**
   * Mock POST request
   * @param path - API endpoint path
   * @param body - Request body (for logging)
   * @param mockResponse - The mock data to return
   * @param customDelay - Optional custom delay override
   */
  async post<T>(
    path: string,
    body: any,
    mockResponse: T,
    customDelay?: number
  ): Promise<MockResponse<T>> {
    console.log(`[MockClient] POST ${path}`, body);
    await this.delay(customDelay);
    console.log(`[MockClient] POST ${path} - Resolved`);
    return {
      data: mockResponse,
      status: 200,
    };
  }

  /**
   * Mock file upload (multipart/form-data simulation)
   * @param path - API endpoint path
   * @param formData - FormData or file object (for logging)
   * @param mockResponse - The mock data to return
   * @param customDelay - Optional custom delay override
   */
  async upload<T>(
    path: string,
    formData: any,
    mockResponse: T,
    customDelay?: number
  ): Promise<MockResponse<T>> {
    console.log(`[MockClient] UPLOAD ${path}`, formData);
    await this.delay(customDelay);
    console.log(`[MockClient] UPLOAD ${path} - Resolved`);
    return {
      data: mockResponse,
      status: 200,
    };
  }

  /**
   * Mock PUT request
   * @param path - API endpoint path
   * @param body - Request body
   * @param mockResponse - The mock data to return
   * @param customDelay - Optional custom delay override
   */
  async put<T>(
    path: string,
    body: any,
    mockResponse: T,
    customDelay?: number
  ): Promise<MockResponse<T>> {
    console.log(`[MockClient] PUT ${path}`, body);
    await this.delay(customDelay);
    console.log(`[MockClient] PUT ${path} - Resolved`);
    return {
      data: mockResponse,
      status: 200,
    };
  }

  /**
   * Mock DELETE request
   * @param path - API endpoint path
   * @param mockResponse - The mock data to return
   * @param customDelay - Optional custom delay override
   */
  async delete<T>(path: string, mockResponse: T, customDelay?: number): Promise<MockResponse<T>> {
    console.log(`[MockClient] DELETE ${path}`);
    await this.delay(customDelay);
    console.log(`[MockClient] DELETE ${path} - Resolved`);
    return {
      data: mockResponse,
      status: 200,
    };
  }
}

export const mockClient = new MockClient();
