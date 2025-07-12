import { useQuery } from '@tanstack/react-query';
import { usePublicLenders } from '@/hooks/usePublicLenders';
import { filterProducts, RecommendationFormData, StaffLenderProduct } from '@/lib/recommendation';

export interface ProductCategory {
  category: string;
  count: number;
  percentage: number;
  products: StaffLenderProduct[];
}

export function useProductCategories(formData: RecommendationFormData) {
  // Production mode: Console logging disabled
  const { data: products = [], isLoading: productsLoading, error: productsError } = usePublicLenders();

  return useQuery({
    queryKey: ['product-categories-cache-only', formData],
    queryFn: () => {
      
      if (productsError) {
        throw productsError;
      }
      
      if (!products || products.length === 0) {
        throw new Error('No products available from staff API');
      }
      
      // Apply filtering logic to get relevant products
      const filteredProducts = filterProducts(products, formData);
      // Production mode: Console logging disabled
      
      // Group products by category
      const categoryGroups: Record<string, StaffLenderProduct[]> = {};
      filteredProducts.forEach(product => {
        const category = product.category;
        if (!categoryGroups[category]) {
          categoryGroups[category] = [];
        }
        categoryGroups[category].push(product);
      });

      // console.log('[useProductCategories] Category groups:', Object.keys(categoryGroups));

      // Calculate statistics for each category
      const totalProducts = filteredProducts.length;
      const categories: ProductCategory[] = Object.entries(categoryGroups)
        .map(([category, categoryProducts]) => ({
          category,
          count: categoryProducts.length,
          percentage: totalProducts > 0 ? Math.round((categoryProducts.length / totalProducts) * 100) : 0,
          products: categoryProducts
        }))
        .sort((a, b) => b.count - a.count); // Sort by count descending

      // console.log('[useProductCategories] Final categories:', categories.length);
      return categories;
    },
    enabled: !productsLoading && !productsError,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false
  });
}