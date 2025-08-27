import { useQuery } from "@tanstack/react-query";
import { fetchCatalogNormalized, CanonicalProduct } from "@/lib/catalog";

// ✅ USING CANONICAL PRODUCT TYPE FROM CATALOG SYSTEM

/**
 * ✅ STEP 1: React Query Hook with 22-Field Schema
 * Fetches comprehensive lender products with full schema support
 */
export function useLenderProducts() {
  return useQuery({
    queryKey: ["lenderProducts"],
    queryFn: async (): Promise<CanonicalProduct[]> => {
      console.log('🔄 Fetching products through canonical catalog system...');
      
      // Use new catalog system with field aliasing and fallback
      const products = await fetchCatalogNormalized();
      
      console.log(`✅ Loaded ${products.length} canonical products with field normalization`);
      return products;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * ✅ STEP 2: Enhanced filtering with interest rates and amounts
 */
export function useLenderProductsByCategory(category?: string) {
  const { data: products = [], ...query } = useLenderProducts();
  
  const filteredProducts = category 
    ? products.filter((product: CanonicalProduct) => 
        product.category.toLowerCase() === category.toLowerCase()
      )
    : products;
    
  return { ...query, data: filteredProducts };
}

/**
 * ✅ STEP 2: Always surface LOC products when within range
 */
export function useRecommendedProducts(amount?: number, creditScore?: number) {
  const { data: products = [], ...query } = useLenderProducts();
  
  if (!amount) return { ...query, data: products };
  
  const recommended = products.filter((product: CanonicalProduct) => {
    const withinAmount = amount >= (product.min_amount || 0) && amount <= (product.max_amount || Infinity);
    const withinCredit = true; // Skip credit checks for now as canonical schema doesn't have min credit score
    
    // Always include Line of Credit products when within range
    const isLOC = product.category.toLowerCase().includes('credit') || 
                  product.category.toLowerCase().includes('line');
    
    return withinAmount && withinCredit && (isLOC || true);
  }).sort((a, b) => {
    // Prioritize LOC products
    const aIsLOC = a.category.toLowerCase().includes('credit');
    const bIsLOC = b.category.toLowerCase().includes('credit');
    
    if (aIsLOC && !bIsLOC) return -1;
    if (!aIsLOC && bIsLOC) return 1;
    
    // Then sort by interest rate
    const aRate = a.interest_rate_min || 0;
    const bRate = b.interest_rate_min || 0;
    return aRate - bRate;
  });
    
  return { ...query, data: recommended };
}

/**
 * ✅ Get unique product categories from 22-field schema
 */
export function useProductCategories() {
  const { data: products = [], ...query } = useLenderProducts();
  
  const categories = [...new Set(
    products.map((p: CanonicalProduct) => p.category).filter(Boolean)
  )];
  
  return { ...query, data: categories };
}

/**
 * ✅ Find product by ID with 22-field schema
 */
export function useLenderProduct(id?: string) {
  const { data: products = [], ...query } = useLenderProducts();
  
  const product = products.find((p: CanonicalProduct) => p.id === id) || null;
  
  return { ...query, data: product };
}

/**
 * ✅ STEP 3: Dynamic document requirements
 */
export function useProductDocuments(productId?: string) {
  const { data: product, ...query } = useLenderProduct(productId);
  
  return { 
    ...query, 
    data: product?.required_documents || [],
    isLoading: query.isLoading
  };
}

// Legacy compatibility - return array directly for older components
export function useLenderProductsArray(): CanonicalProduct[] {
  const { data } = useLenderProducts();
  return data || [];
}

export function useProductCategoriesArray(): string[] {
  const { data } = useProductCategories();
  return data || [];
}