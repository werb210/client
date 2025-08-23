import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

// ✅ ENHANCED: Schema validation for live API integration
const LenderProductSchema = z.object({
  ok: z.boolean(),
  count: z.number(),
  products: z.array(
    z.object({
      id: z.string(),
      lenderName: z.string().optional(),
      productName: z.string().optional(),
      name: z.string().optional(), // Support both name formats
      category: z.string(),
      country: z.string().optional(),
      minAmount: z.number().optional(),
      maxAmount: z.number().optional(),
      interestRate: z.number().optional(),
      termLength: z.string().optional(),
      documentsRequired: z.array(z.string()).optional(),
      requiredDocuments: z.array(z.string()).optional(), // Support both formats
      description: z.string().optional(),
      updatedAt: z.string().optional(),
    }).passthrough() // Allow additional fields for flexibility
  ),
});

interface LenderProduct {
  id?: string;
  productId?: string;
  category?: string;
  productCategory?: string;
  name?: string;
  lender?: string;
  requiredDocuments?: string[];
  [key: string]: any;
}

/**
 * ✅ ENABLED: Load lender products from local sync
 * Products are synced from staff app and stored locally
 */
export function useLenderProducts(): LenderProduct[] {
  const [products, setProducts] = useState<LenderProduct[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Try client-facing API first, fallback to local cache
        let res = await fetch(`${import.meta.env.VITE_API_URL}/lender-products`);
        let data;
        
        if (res.ok) {
          const apiData = await res.json();
          data = apiData.products || apiData;
          console.log(`✅ Loaded ${Array.isArray(data) ? data.length : 0} lender products from client API`);
        } else {
          console.warn(`⚠️ Client API failed (${res.status}), falling back to local cache`);
          // Fallback to local cache
          res = await fetch("/data/lenderProducts.json");
          if (!res.ok) {
            throw new Error("Failed to load from both client API and local cache");
          }
          data = await res.json();
          console.log(`✅ Loaded ${Array.isArray(data) ? data.length : 0} lender products from local cache`);
        }
        
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("❌ Failed to load lender products:", error);
        setProducts([]);
      }
    }
    fetchProducts();
  }, []);

  return products;
}

/**
 * ✅ ENHANCED: React Query with schema validation
 */
export const useLenderProductsQuery = () => {
  return useQuery({
    queryKey: ["lender-products-client-api"],
    queryFn: async () => {
      return await fetchLenderProducts();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * ✅ ENHANCED: Fetch with schema validation
 */
export async function fetchLenderProducts(): Promise<LenderProduct[]> {
  try {
    // Try live API first with schema validation
    const res = await fetch(`${import.meta.env.VITE_API_URL}/lender-products`);
    
    if (res.ok) {
      const apiData = await res.json();
      const parsed = LenderProductSchema.safeParse(apiData);
      
      if (parsed.success) {
        console.log(`✅ Loaded ${parsed.data.count} validated lender products from live API`);
        return parsed.data.products;
      } else {
        console.warn("⚠️ Live API returned invalid schema, falling back to cache:", parsed.error.issues);
      }
    } else {
      console.warn(`⚠️ Live API failed (${res.status}), falling back to local cache`);
    }
    
    // Fallback to local cache
    const cacheRes = await fetch("/data/lenderProducts.json");
    if (cacheRes.ok) {
      const cacheData = await cacheRes.json();
      const products = Array.isArray(cacheData) ? cacheData : [];
      console.log(`✅ Loaded ${products.length} lender products from local cache`);
      return products;
    }
    
    throw new Error("Failed to load from both live API and local cache");
  } catch (error) {
    console.error("❌ Failed to load lender products:", error);
    return [];
  }
}

/**
 * ✅ ENABLED: Get products by category
 */
export function useLenderProductsByCategory(category?: string): LenderProduct[] {
  const products = useLenderProducts();
  
  if (!category) return products;
  
  return products.filter((product: LenderProduct) => 
    product.category?.toLowerCase() === category.toLowerCase() ||
    product.productCategory?.toLowerCase() === category.toLowerCase()
  );
}

/**
 * ✅ ENABLED: Get unique categories
 */
export function useProductCategories(): string[] {
  const products = useLenderProducts();
  
  const categories = [...new Set(
    products.map((p: LenderProduct) => p.category || p.productCategory).filter(Boolean)
  )];
  
  return categories as string[];
}

/**
 * ✅ ENABLED: Find product by ID
 */
export function useLenderProduct(id?: string): LenderProduct | null {
  const products = useLenderProducts();
  
  return products.find((p: LenderProduct) => p.id === id || p.productId === id) || null;
}

// Keep disabled functions for backward compatibility
export function useLenderProductsLive() {
  // No-op - using local sync instead
  return;
}

// Export types for external use
export type { LenderProduct };
export type LenderProductsResponse = { products: LenderProduct[] };
export type LenderProductFilters = Record<string, any>;