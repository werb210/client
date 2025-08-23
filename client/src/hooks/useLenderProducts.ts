import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

// ✅ CANONICAL 12-FIELD SCHEMA - Matches staff API exactly
const LenderProductSchema = z.object({
  id: z.string(),
  lenderName: z.string(),
  productName: z.string(), 
  category: z.string(),
  country: z.string(),
  minAmount: z.number(),
  maxAmount: z.number(),
  interestRate: z.number(),
  termLength: z.string(),
  documentsRequired: z.array(z.string()),
  description: z.string(),
  updatedAt: z.string(),
});

const LenderProductsResponseSchema = z.object({
  success: z.boolean(),
  products: z.array(LenderProductSchema),
  count: z.number(),
});

export type LenderProduct = z.infer<typeof LenderProductSchema>;
export type LenderProductsResponse = z.infer<typeof LenderProductsResponseSchema>;

/**
 * ✅ FIX BLOCK: Smart fallback - Staff API with local compatibility
 * Fetches from staff API first, falls back to local with schema transformation
 */
export function useLenderProducts() {
  return useQuery({
    queryKey: ["lender-products"],
    queryFn: async (): Promise<LenderProduct[]> => {
      // Try staff API first for 32 products with canonical schema
      try {
        console.log('🔄 Attempting to fetch from staff API...');
        const staffRes = await fetch("https://staff.boreal.financial/api/lender-products", {
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        
        if (staffRes.ok) {
          const staffData = await staffRes.json();
          if (staffData.success && staffData.products) {
            console.log(`✅ Loaded ${staffData.count} products from staff API (canonical schema)`);
            return staffData.products;
          }
        }
      } catch (error) {
        console.warn('⚠️ Staff API unavailable, falling back to local database...', error);
      }
      
      // Fallback to local database with schema transformation
      console.log('🔄 Fetching from local database with schema transformation...');
      const localRes = await fetch("/api/lender-products");
      const localData = await localRes.json();
      
      if (!localData.success) {
        throw new Error("Failed to fetch lender products from both staff API and local database");
      }
      
      // Transform local database schema to canonical 12-field schema
      const transformedProducts: LenderProduct[] = localData.products.map((product: any) => ({
        id: product.id.toString(),
        lenderName: "Boreal Financial", // Default lender name
        productName: product.name,
        category: product.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        country: "US", // Default country
        minAmount: parseFloat(product.min_amount) || 0,
        maxAmount: parseFloat(product.max_amount) || 0,
        interestRate: parseFloat(product.interest_rate_min) || 0,
        termLength: `${product.term_min || 0}-${product.term_max || 0} months`,
        documentsRequired: product.requirements || [],
        description: product.description || "",
        updatedAt: new Date().toISOString(),
      }));
      
      console.log(`✅ Loaded ${transformedProducts.length} products from local database (transformed to canonical schema)`);
      return transformedProducts;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * ✅ Get products by category - using canonical schema
 */
export function useLenderProductsByCategory(category?: string) {
  const { data: products = [], ...query } = useLenderProducts();
  
  const filteredProducts = category 
    ? products.filter((product: LenderProduct) => 
        product.category.toLowerCase() === category.toLowerCase()
      )
    : products;
    
  return { ...query, data: filteredProducts };
}

/**
 * ✅ Get unique product categories - using canonical schema
 */
export function useProductCategories() {
  const { data: products = [], ...query } = useLenderProducts();
  
  const categories = [...new Set(
    products.map((p: LenderProduct) => p.category).filter(Boolean)
  )];
  
  return { ...query, data: categories };
}

/**
 * ✅ Find product by ID - using canonical schema
 */
export function useLenderProduct(id?: string) {
  const { data: products = [], ...query } = useLenderProducts();
  
  const product = products.find((p: LenderProduct) => p.id === id) || null;
  
  return { ...query, data: product };
}

// Legacy compatibility - return array directly for older components
export function useLenderProductsArray(): LenderProduct[] {
  const { data } = useLenderProducts();
  return data || [];
}

export function useProductCategoriesArray(): string[] {
  const { data } = useProductCategories();
  return data || [];
}