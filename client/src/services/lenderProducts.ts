/**
 * Client-side lender products service
 * Loads products from local sync data
 */

/**
 * ✅ ENABLED: Fetch lender products from local sync
 */
export async function fetchLenderProducts() {
  try {
    const res = await fetch("/data/lenderProducts.json");
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("❌ Failed to load lender products:", error);
    return [];
  }
}

/**
 * ✅ ENABLED: Get product categories
 */
export async function getProductCategories() {
  const products = await fetchLenderProducts();
  const categories = [...new Set(
    products.map(p => p.category || p.productCategory).filter(Boolean)
  )];
  return categories;
}

/**
 * ✅ ENABLED: Find product by ID
 */
export async function findProductById(id: string) {
  const products = await fetchLenderProducts();
  return products.find(p => p.id === id || p.productId === id) || null;
}

/**
 * ✅ ENABLED: Get products by category
 */
export async function getProductsByCategory(category: string) {
  const products = await fetchLenderProducts();
  return products.filter(p => 
    p.category?.toLowerCase() === category.toLowerCase() ||
    p.productCategory?.toLowerCase() === category.toLowerCase()
  );
}