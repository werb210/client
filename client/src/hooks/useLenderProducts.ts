import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

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
        let res = await fetch(`${import.meta.env.VITE_API_URL}/lender-products`, {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_CLIENT_API_KEY}`,
          },
        });
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
 * ✅ ENABLED: React Query version for consistent API
 */
export const useLenderProductsQuery = () => {
  return useQuery({
    queryKey: ["lender-products-client-api"],
    queryFn: async () => {
      // Try client-facing API first, fallback to local cache
      let res = await fetch(`${import.meta.env.VITE_API_URL}/lender-products`, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_CLIENT_API_KEY}`,
        },
      });
      let data;
      
      if (res.ok) {
        const apiData = await res.json();
        data = apiData.products || apiData;
        console.log(`✅ Loaded ${data.length} lender products from client API`);
      } else {
        console.warn(`⚠️ Client API failed (${res.status}), falling back to local cache`);
        // Fallback to local cache
        res = await fetch("/data/lenderProducts.json");
        if (!res.ok) {
          throw new Error("Failed to load from both client API and local cache");
        }
        data = await res.json();
        console.log(`✅ Loaded ${data.length} lender products from local cache`);
      }
      
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

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