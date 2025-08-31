import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from "../api/products";
import { LenderProduct } from '@/db/lenderProducts';

export interface UseLenderProductsResult {
  products: LenderProduct[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useLenderProducts(): UseLenderProductsResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/v1/products'],
    queryFn: async () => { /* ensure products fetched */ 
      const response = await /* rewired */
      if (!response.ok) {
        throw new Error('Failed to fetch lender products');
      }
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch lender products');
      }
      return result.products || [];
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    products: data || [],
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

// Additional hook for filtered products
export function useFilteredLenderProducts(
  category?: string,
  amount?: number,
  country?: string
): UseLenderProductsResult {
  const { products, isLoading, error, refetch } = useLenderProducts();

  const filteredProducts = products.filter(product => {
    const matchesCategory = !category || product.productCategory === category;
    const matchesAmount = !amount || (amount >= product.minimumLendingAmount && amount <= product.maximumLendingAmount);
    const matchesCountry = !country || product.countryOffered === country || product.countryOffered === 'United States';
    const isActive = product.isActive !== false;
    
    return matchesCategory && matchesAmount && matchesCountry && isActive;
  });

  return {
    products: filteredProducts,
    isLoading,
    error,
    refetch,
  };
}

// Additional hook for manual sync functionality
export function useLenderProductsSync() {
  const queryClient = useQuery.useQueryClient?.() || null;
  
  const syncProducts = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/catalog/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Invalidate and refetch products
        if (queryClient) {
          queryClient.invalidateQueries({ queryKey: ['/api/v1/products'] });
        }
        return { success: true, message: 'Products synced successfully' };
      } else {
        return { success: false, message: 'Failed to sync products' };
      }
    } catch (error) {
      console.error('Error syncing products:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  };

  return { syncProducts };
}