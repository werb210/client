import { getProducts } from "../api/products";
/**
 * Strongly-typed client for Staff API V2
 * Generated from expanded lender product schema
 */

import type { LenderProduct, LenderProductsResponse, LenderProductFilters } from './staff.d.ts';

export interface StaffClientConfig {
  baseUrl: string;
  timeout?: number;
}

export class StaffClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: StaffClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = config.timeout || 10000;
  }

  /**
   * Fetch lender products with optional filters
   */
  async publicLendersList(filters?: LenderProductFilters): Promise<LenderProductsResponse> { /* ensure products fetched */ 
    const url = new URL(`${this.baseUrl}/api/public/lenders`);
    
    // Add filter parameters to URL
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Staff API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Normalize response format
      if (Array.isArray(data)) {
        return {
          success: true,
          products: data,
          count: data.length,
          total: data.length
        };
      }
      
      if (data.products && Array.isArray(data.products)) {
        return {
          success: data.success ?? true,
          products: data.products,
          count: data.count ?? data.products.length,
          total: data.total ?? data.products.length,
          page: data.page,
          limit: data.limit
        };
      }

      throw new Error('Invalid response format from Staff API');

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Staff API timeout after ${this.timeout}ms`);
      }
      
      throw error;
    }
  }

  /**
   * Get a single lender product by ID
   */
  async getLenderProduct(id: string): Promise<LenderProduct> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await /* rewired */

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Staff API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Staff API timeout after ${this.timeout}ms`);
      }
      
      throw error;
    }
  }
}

/**
 * Create a new StaffClient instance
 */
export function createClient(config: StaffClientConfig): StaffClient {
  return new StaffClient(config);
}

/**
 * Default client instance with same-origin configuration
 */
export const staffClient = createClient({
  baseUrl: '', // Same-origin only
  timeout: 15000
});

// Export types for external use
export type { LenderProduct, LenderProductsResponse, LenderProductFilters } from './staff.d.ts';