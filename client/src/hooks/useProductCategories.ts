import { useQuery } from '@tanstack/react-query';
import { usePublicLenders } from '@/hooks/usePublicLenders';
import { filterProducts, RecommendationFormData } from '@/lib/recommendation';
import { LenderProduct } from '@/types/lenderProduct';

export interface ProductCategory {
  category: string;
  count: number;
  percentage: number;
  products: LenderProduct[];
}

export function useProductCategories(formData: RecommendationFormData) {
  // Use the updated usePublicLenders hook
  const { data: products = [], isLoading: productsLoading, error: productsError } = usePublicLenders();

  return useQuery({
    queryKey: ['product-categories', formData],
    queryFn: async () => {
      try {
        console.log(`🔍 [useProductCategories] Starting with ${products.length} products`);
        console.log(`🔍 [useProductCategories] FormData received:`, formData);
        
        if (productsError) {
          console.warn('[useProductCategories] Products error:', productsError);
          return [];
        }
        
        if (!products || products.length === 0) {
          console.warn('[useProductCategories] No products available - will retry when products load');
          return [];
        }
      
        // Apply filtering logic to get relevant products
        console.log(`🔍 [useProductCategories] About to call filterProducts with:`, formData);
        
        // For testing: if no meaningful form data, show all products
        const hasFormData = formData && (formData.lookingFor || formData.fundingAmount);
        const filteredProducts = hasFormData ? filterProducts(products, formData) : products;
        console.log(`🔍 [useProductCategories] filterProducts returned ${filteredProducts.length} products (hasFormData: ${hasFormData})`);
        
        if (filteredProducts.length === 0 && hasFormData) {
          console.error(`❌ [useProductCategories] ZERO PRODUCTS AFTER FILTERING!`);
          console.error(`❌ [useProductCategories] Input data:`, formData);
          console.error(`❌ [useProductCategories] Raw products count:`, products.length);
          // Fallback: use all products for testing
          const allProducts = products;
          console.log(`🔄 [useProductCategories] Falling back to all ${allProducts.length} products`);
        }
        
        if (filteredProducts.length === 0) {
          console.log('[useProductCategories] No products match filters - showing sample of raw products:');
          console.log('[useProductCategories] First 3 products:', products.slice(0, 3).map((p: any) => ({
            name: p.productName,
            country: p.countryOffered,
            category: p.productCategory,
            minAmount: p.minimumLendingAmount,
            maxAmount: p.maximumLendingAmount
          })));
          console.log('[useProductCategories] Form data filters:', formData);
        }
      
        // Group products by category
        const categoryGroups: Record<string, LenderProduct[]> = {};
        const productsToProcess = filteredProducts.length > 0 ? filteredProducts : products;
        productsToProcess.forEach(product => {
          const category = product.category || product.productCategory;
          if (!categoryGroups[category]) {
            categoryGroups[category] = [];
          }
          categoryGroups[category].push(product);
          
          // Debug: Log product categorization for Accord products
          if (product.productName?.includes('Accord') || product.lenderName?.includes('Accord')) {
            console.log(`🔍 [CATEGORIZATION] ${product.productName} → Category: "${product.productCategory}"`);
          }
          
          // Debug: Log all Working Capital products being categorized
          if ((product.category || product.productCategory) === 'Working Capital') {
            console.log(`💼 [WORKING_CAPITAL] Adding product: ${product.name || product.productName} (${product.lender_name || product.lenderName}) - ID: ${product.id}`);
          }
        });

        // Debug: Log final Working Capital category details
        if (categoryGroups['Working Capital']) {
          console.log(`💼 [WORKING_CAPITAL] Final group has ${categoryGroups['Working Capital'].length} products:`);
          categoryGroups['Working Capital'].forEach((p, i) => {
            console.log(`   ${i+1}. ${p.productName} (${p.lenderName}) - ID: ${p.id}`);
          });
        }

        // console.log('[useProductCategories] Category groups:', Object.keys(categoryGroups));

        // Calculate statistics for each category
        const totalProducts = productsToProcess.length;
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
      } catch (error: unknown) {
        console.error('[useProductCategories] Error in queryFn:', error);
        console.error('[useProductCategories] Error details:', error instanceof Error ? error.message : String(error));
        console.error('[useProductCategories] Form data causing error:', formData);
        console.error('[useProductCategories] Products causing error:', products?.length || 0);
        return []; // Return empty array on any error
      }
    },
    enabled: !productsLoading, // Remove the products.length requirement
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3
  });
}