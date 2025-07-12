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

  // console.log('[useProductCategories] Products state:', {
  //   productCount: products.length,
  //   productsLoading,
  //   productsError: productsError?.message,
  //   formData
  // });

  return useQuery({
    queryKey: ['product-categories', formData],
    queryFn: () => {
      // Temporary debug logging to diagnose filtering issue
      console.log('[DEBUG] useProductCategories - Input:', {
        totalProducts: products.length,
        formData: {
          headquarters: formData.headquarters,
          fundingAmount: formData.fundingAmount,
          lookingFor: formData.lookingFor,
          accountsReceivableBalance: formData.accountsReceivableBalance,
          fundsPurpose: formData.fundsPurpose
        },
        sampleProduct: products[0] ? {
          name: products[0].name,
          category: products[0].category,
          geography: products[0].geography,
          country: products[0].country,
          minAmount: products[0].minAmount,
          maxAmount: products[0].maxAmount
        } : null
      });
      
      if (productsError) {
        throw productsError;
      }
      
      if (!products || products.length === 0) {
        throw new Error('No products available from staff API');
      }
      
      // Apply filtering logic to get relevant products
      const filteredProducts = filterProducts(products, formData);
      console.log('[DEBUG] Filtering results:', {
        inputProducts: products.length,
        filteredProducts: filteredProducts.length,
        filterCriteria: formData
      });
      
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
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}