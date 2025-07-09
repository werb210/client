import { useQuery } from '@tanstack/react-query';

export interface LenderProduct {
  id: string;
  product_name: string;
  lender_name: string;
  product_type: string;
  geography: string[];
  min_amount: number;
  max_amount: number;
  min_revenue?: number;
  industries?: string[];
  video_url?: string;
  description?: string;
  interest_rate_min?: number;
  interest_rate_max?: number;
  term_min?: number;
  term_max?: number;
  requirements?: string[];
  active?: boolean;
}

interface LenderProductsResponse {
  products: LenderProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface LenderFilters {
  type?: string;
  min_amount?: number;
  max_amount?: number;
  geography?: string | string[];
  industries?: string | string[];
  active?: boolean;
}

export function useLocalLenders(filters?: LenderFilters) {
  return useQuery({
    queryKey: ['local-lenders', filters],
    queryFn: async (): Promise<LenderProduct[]> => {
      const params = new URLSearchParams();
      
      if (filters?.type) {
        params.append('type', filters.type);
      }
      
      if (filters?.min_amount) {
        params.append('min_amount', filters.min_amount.toString());
      }
      
      if (filters?.max_amount) {
        params.append('max_amount', filters.max_amount.toString());
      }
      
      if (filters?.geography) {
        const geoArray = Array.isArray(filters.geography) ? filters.geography : [filters.geography];
        geoArray.forEach(geo => params.append('geography', geo));
      }
      
      if (filters?.industries) {
        const industryArray = Array.isArray(filters.industries) ? filters.industries : [filters.industries];
        industryArray.forEach(industry => params.append('industries', industry));
      }
      
      if (filters?.active !== undefined) {
        params.append('active', filters.active.toString());
      }
      
      const queryString = params.toString();
      const url = `/api/local/lenders${queryString ? `?${queryString}` : ''}`;
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch(fetchError => {
          console.warn('[LOCAL_LENDERS] Network error:', fetchError.message);
          throw new Error(`Network error: ${fetchError.message}`);
        });
        
        if (!response.ok) {
          console.warn('[LOCAL_LENDERS] API error:', response.status, response.statusText);
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data: LenderProductsResponse = await response.json().catch(jsonError => {
          throw new Error(`Invalid JSON response: ${jsonError.message}`);
        });
        
        return data.products;
      } catch (error) {
        console.warn('[LOCAL_LENDERS] Query failed:', error instanceof Error ? error.message : error);
        // Return empty array to prevent app crash
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useLocalLenderStats() {
  return useQuery({
    queryKey: ['local-lender-stats'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/local/lenders/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch(fetchError => {
          console.warn('[LOCAL_LENDER_STATS] Network error:', fetchError.message);
          throw new Error(`Network error: ${fetchError.message}`);
        });
        
        if (!response.ok) {
          console.warn('[LOCAL_LENDER_STATS] API error:', response.status, response.statusText);
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json().catch(jsonError => {
          throw new Error(`Invalid JSON response: ${jsonError.message}`);
        });
      } catch (error) {
        console.warn('[LOCAL_LENDER_STATS] Query failed:', error instanceof Error ? error.message : error);
        // Return empty stats to prevent app crash
        return { total: 0, categories: [], averageAmount: 0 };
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}