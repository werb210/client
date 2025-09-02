import { useQuery } from '@tanstack/react-query';

export interface RecommendationFormData {
  headquarters: string;
  fundingAmount: number;
  lookingFor: 'capital' | 'equipment' | 'both';
  accountsReceivableBalance: number;
  fundsPurpose: string;
}

// Adapter function to maintain compatibility
function filterProducts(products: any[], formData: Partial<RecommendationFormData>): any[] {
  if (!products || products.length === 0) return [];
  
  const hasRealFormData = formData && Object.keys(formData).length > 0 && 
    (formData.lookingFor || formData.fundingAmount || formData.headquarters);
  
  if (!hasRealFormData) {
    return products.filter(product => product.active !== false);
  }
  
  // Simple filtering based on country and funding amount
  const country = formData.headquarters === 'united_states' ? 'US' : 'CA';
  const fundingAmount = formData.fundingAmount || 0;
  
  return products.filter(product => {
    // Country match
    if (product.country !== country) return false;
    
    // Amount range (if available)
    if (product.min_amount && fundingAmount < product.min_amount) return false;
    if (product.max_amount && product.max_amount > 0 && fundingAmount > product.max_amount) return false;
    
    return product.active !== false;
  });
}
import { LenderProduct } from '@/types/lenderProduct';

export interface ProductCategory {
  category: string;
  count: number;
  percentage: number;
  products: LenderProduct[];
}

export function useProductCategories(formData: RecommendationFormData) {
  // Use local cache for products instead of API calls
  const loadProductsFromCache = async () => {
    const cacheKey = 'bf:products:v1';
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        const products = parsed.data || parsed;
        if (Array.isArray(products) && products.length > 0) {
          return products;
        }
      } catch (error) {
        console.warn('Cache parse error:', error);
      }
    }
    
    // If cache empty, fetch once and cache
    const response = await fetch('/api/v1/products');
    const products = await response.json();
    const productArray = Array.isArray(products) ? products : [];
    
    // Cache for future use
    localStorage.setItem(cacheKey, JSON.stringify({ 
      at: Date.now(), 
      source: 'api', 
      data: productArray 
    }));
    
    return productArray;
  };

  return useQuery({
    queryKey: ['product-categories', formData],
    queryFn: async () => {
      try {
        const products = await loadProductsFromCache();
        console.log(`🔍 [useProductCategories] Starting with ${products.length} products`);
        console.log(`🔍 [useProductCategories] FormData received:`, formData);
        
        if (!products || products.length === 0) {
          console.warn('[useProductCategories] No products available');
          return [];
        }
      
        // Apply filtering logic to get relevant products
        console.log(`🔍 [useProductCategories] About to call filterProducts with:`, formData);
        
        // For testing: if no meaningful form data, show all products
        const hasRealFormData = formData && formData.lookingFor && formData.fundingAmount;
        
        if (!hasRealFormData) {
          console.log(`🔧 [useProductCategories] No real form data (lookingFor: ${formData?.lookingFor}, fundingAmount: ${formData?.fundingAmount}) - using all ${products.length} products`);
        }
        
        const filteredProducts = hasRealFormData ? filterProducts(products, formData) : products;
        console.log(`🔍 [useProductCategories] filterProducts returned ${filteredProducts.length} products (hasRealFormData: ${hasRealFormData})`);
        
        if (filteredProducts.length === 0 && hasRealFormData) {
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
        productsToProcess.forEach((product: any) => {
          const category = product.category;
          if (!categoryGroups[category]) {
            categoryGroups[category] = [];
          }
          categoryGroups[category].push(product);
          
          // Debug: Log product categorization for Accord products
          if (product.name?.includes('Accord') || product.lender_name?.includes('Accord')) {
            console.log(`🔍 [CATEGORIZATION] ${product.name} → Category: "${product.category}"`);
          }
          
          // Debug: Log all Working Capital products being categorized
          if (product.category === 'Working Capital') {
            console.log(`💼 [WORKING_CAPITAL] Adding product: ${product.name} (${product.lender_name}) - ID: ${product.id}`);
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