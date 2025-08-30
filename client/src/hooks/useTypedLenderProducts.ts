import { fetchProducts } from "../api/products";
/**
 * Strongly-typed lender products hook using generated OpenAPI types
 * Provides type-safe access to the V2 lender product schema
 */

import { useQuery } from '@tanstack/react-query';
import { paths, components } from '@/types/api';

// Extract types from generated OpenAPI schema
type LenderProductsResponse = paths['/api/public/lenders']['get']['responses'][200]['content']['application/json'];
type LenderProduct = components['schemas']['LenderProduct'];

interface LenderProductFilters {
  productCategory?: string;
  minAmount?: number;
  maxAmount?: number;
  geography?: string;
  isActive?: boolean;
}

/**
 * Strongly-typed fetch function for lender products
 */
async function fetchTypedLenderProducts(filters?: LenderProductFilters): Promise<LenderProductsResponse> { /* ensure products fetched */ 
  const url = new URL('/api/public/lenders', window.location.origin);
  
  // Add filters as query parameters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  // Normalize response format to match OpenAPI schema
  if (Array.isArray(data)) {
    return {
      success: true,
      products: data,
      count: data.length,
      total: data.length
    };
  }
  
  return data;
}

/**
 * Main hook for fetching all lender products with type safety
 */
export function useTypedLenderProducts(filters?: LenderProductFilters) {
  return useQuery({
    queryKey: ['typed-lender-products', filters],
    queryFn: () => fetchTypedLenderProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook for fetching products by specific category
 */
export function useTypedLenderProductsByCategory(productCategory: string) {
  return useTypedLenderProducts({ productCategory });
}

/**
 * Hook for fetching products by amount range
 */
export function useTypedLenderProductsByAmount(minAmount?: number, maxAmount?: number) {
  return useTypedLenderProducts({ minAmount, maxAmount });
}

/**
 * Hook for fetching products by geography
 */
export function useTypedLenderProductsByGeography(geography: string) {
  return useTypedLenderProducts({ geography });
}

/**
 * Type-safe helper functions for working with V2 schema
 */

/**
 * Format product category for display
 */
export function formatProductCategory(category: string): string {
  return category
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Check if product matches amount criteria
 */
export function matchesAmountCriteria(product: LenderProduct, targetAmount: number): boolean {
  return targetAmount >= product.minAmountUsd && targetAmount <= product.maxAmountUsd;
}

/**
 * Format interest rate display
 */
export function formatInterestRate(product: LenderProduct): string {
  if (product.interestRateMin && product.interestRateMax) {
    return `${product.interestRateMin}% - ${product.interestRateMax}%`;
  }
  if (product.interestRateMin) {
    return `From ${product.interestRateMin}%`;
  }
  if (product.interestRateMax) {
    return `Up to ${product.interestRateMax}%`;
  }
  return 'Rate varies';
}

/**
 * Format term range display
 */
export function formatTermRange(product: LenderProduct): string {
  if (product.termMinMonths && product.termMaxMonths) {
    return `${product.termMinMonths}-${product.termMaxMonths} months`;
  }
  if (product.termMinMonths) {
    return `From ${product.termMinMonths} months`;
  }
  if (product.termMaxMonths) {
    return `Up to ${product.termMaxMonths} months`;
  }
  return 'Terms vary';
}

/**
 * Format funding amount display
 */
export function formatFundingAmount(product: LenderProduct): string {
  const min = product.minAmountUsd.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  const max = product.maxAmountUsd.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return `${min} - ${max}`;
}

/**
 * Get product details for UI display
 */
export function getProductDetails(product: LenderProduct) {
  return {
    id: product.id,
    lender: product.lender,
    product: product.product,
    category: formatProductCategory(product.productCategory),
    amountRange: formatFundingAmount(product),
    interestRate: formatInterestRate(product),
    termRange: formatTermRange(product),
    rateType: product.rateType || 'Not specified',
    frequency: product.interestFrequency || 'Not specified',
    requiredDocs: product.requiredDocs,
    description: product.description,
    isActive: product.isActive,
  };
}

/**
 * Filter products by multiple criteria
 */
export function filterProducts(
  products: LenderProduct[],
  criteria: {
    category?: string;
    minAmount?: number;
    maxAmount?: number;
    geography?: string;
  }
): LenderProduct[] {
  return products.filter(product => {
    if (criteria.category && product.productCategory !== criteria.category) {
      return false;
    }
    
    if (criteria.minAmount && product.maxAmountUsd < criteria.minAmount) {
      return false;
    }
    
    if (criteria.maxAmount && product.minAmountUsd > criteria.maxAmount) {
      return false;
    }
    
    if (criteria.geography && product.geography && !product.geography.includes(criteria.geography)) {
      return false;
    }
    
    return product.isActive !== false; // Include if isActive is true or undefined
  });
}

// Export types for external use
export type { LenderProduct, LenderProductsResponse, LenderProductFilters };