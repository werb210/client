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
  const { data: products = [], isLoading: productsLoading, error: productsError } = usePublicLenders();

  return useQuery({
    queryKey: ['product-categories', formData],
    queryFn: () => {
      // Apply filtering logic to get relevant products
      const filteredProducts = filterProducts(products, formData);
      
      // Group products by category
      const categoryGroups: Record<string, StaffLenderProduct[]> = {};
      filteredProducts.forEach(product => {
        const category = product.category;
        if (!categoryGroups[category]) {
          categoryGroups[category] = [];
        }
        categoryGroups[category].push(product);
      });

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

      return categories;
    },
    enabled: products.length > 0 && !productsLoading,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}