/**
 * Document Name Normalization Utilities
 * Handles migration from legacy document names to standardized format
 */

/**
 * Normalize document requirement names from legacy format
 */
export function normalizeDocumentNames(reqs: string[]): string[] {
  return reqs.map(r => {
    if (r === 'Financial Statements' || r === 'Audited Financials') {
      return 'Accountant Prepared Financial Statements';
    }
    return r;
  });
}

/**
 * Normalize single document name
 */
export function normalizeDocumentName(name: string): string {
  if (name === 'Financial Statements' || name === 'Audited Financials') {
    return 'Accountant Prepared Financial Statements';
  }
  return name;
}

/**
 * Check if IndexedDB cache contains legacy document names
 */
export async function hasLegacyDocumentNames(): Promise<boolean> {
  try {
    const { get } = await import('idb-keyval');
    const cached = await get('lender_products_cache');
    
    if (!cached?.products) return false;
    
    for (const product of cached.products) {
      if (product.doc_requirements) {
        const hasLegacy = product.doc_requirements.some((req: string) => 
          req === 'Financial Statements' || req === 'Audited Financials'
        );
        if (hasLegacy) return true;
      }
    }
    
    return false;
  } catch (error) {
    console.warn('[NORMALIZE] Failed to check legacy document names:', error);
    return false;
  }
}

/**
 * Clean up legacy document names in IndexedDB cache
 */
export async function cleanupLegacyDocumentNames(): Promise<{ updated: boolean; productCount: number }> {
  try {
    const { get, set } = await import('idb-keyval');
    const cached = await get('lender_products_cache');
    
    if (!cached?.products) {
      return { updated: false, productCount: 0 };
    }
    
    let hasUpdates = false;
    const updatedProducts = cached.products.map((product: any) => {
      if (product.doc_requirements) {
        const originalReqs = [...product.doc_requirements];
        const normalizedReqs = normalizeDocumentNames(product.doc_requirements);
        
        if (JSON.stringify(originalReqs) !== JSON.stringify(normalizedReqs)) {
          hasUpdates = true;
          // console.log(`[NORMALIZE] Updated ${product.name}: ${originalReqs.join(', ')} → ${normalizedReqs.join(', ')}`);
          return { ...product, doc_requirements: normalizedReqs };
        }
      }
      return product;
    });
    
    if (hasUpdates) {
      const updatedCache = {
        ...cached,
        products: updatedProducts,
        lastUpdated: Date.now(),
        normalized: true
      };
      
      await set('lender_products_cache', updatedCache);
      // console.log(`[NORMALIZE] ✅ Updated ${cached.products.length} products in IndexedDB cache`);
    }
    
    return { updated: hasUpdates, productCount: cached.products.length };
  } catch (error) {
    console.error('[NORMALIZE] Failed to cleanup legacy document names:', error);
    return { updated: false, productCount: 0 };
  }
}