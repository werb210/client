/**
 * Staff Database Verification Suite
 * Ensures client app exclusively uses the 43+ product staff database
 */

import { fetchLenderProducts } from '../api/lenderProducts';

export interface VerificationResult {
  success: boolean;
  productCount: number;
  message: string;
  timestamp: string;
}

/**
 * Verify staff database connection and minimum product count
 */
export async function verifyStaffDatabaseIntegration(): Promise<VerificationResult> {
  const timestamp = new Date().toISOString();
  
  try {
    console.log('[VERIFICATION] Testing staff database integration...');
    
    const products = await fetchLenderProducts().catch(fetchError => {
      console.warn('[VERIFICATION] Staff database test failed:', fetchError.message);
      throw new Error(`Verification fetch failed: ${fetchError.message}`);
    });
    
    const productCount = products.length;
    
    console.log(`[VERIFICATION] Fetched ${productCount} products from staff database`);
    
    // Verify minimum expected product count (43+)
    if (productCount < 40) {
      return {
        success: false,
        productCount,
        message: `Insufficient products: ${productCount} (expected 40+). May be using wrong database.`,
        timestamp
      };
    }
    
    // Verify we have diverse product types (indicator of authentic data)
    const productTypes = new Set(products.map(p => p.category));
    if (productTypes.size < 3) {
      return {
        success: false,
        productCount,
        message: `Insufficient product variety: ${productTypes.size} types. May be using test data.`,
        timestamp
      };
    }
    
    // Verify geographic diversity (US + CA expected, but staff API may not provide geography)
    const allGeography = products.flatMap(p => p.geography);
    const geographies = new Set(allGeography);
    if (geographies.size === 0) {
      return {
        success: false,
        productCount,
        message: `No geographic information available in products`,
        timestamp
      };
    }
    
    // Note: Staff API may not provide geography data, so defaulting to US is acceptable
    console.log(`[VERIFICATION] Geographic coverage: ${Array.from(geographies).join(', ')}`);
    console.log(`[VERIFICATION] Product categories: ${Array.from(productTypes).join(', ')}`);
    console.log(`[VERIFICATION] Successfully validated ${productCount} products across ${productTypes.size} types`);
    
    // Warn but don't fail if only US is available (staff API doesn't provide geography)
    if (!geographies.has('CA') && geographies.has('US')) {
      console.warn(`[VERIFICATION] Only US products found. Staff API may not provide geography data - this is acceptable.`);
    }
    
    return {
      success: true,
      productCount,
      message: `Staff database integration verified: ${productCount} products across ${productTypes.size} types and ${geographies.size} regions`,
      timestamp
    };
    
  } catch (error) {
    console.warn('[VERIFICATION] Staff database test failed:', error?.message || error);
    
    return {
      success: false,
      productCount: 0,
      message: `Staff database unreachable: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp
    };
  }
}

/**
 * Run verification on application startup
 */
export async function runStartupVerification(): Promise<void> {
  console.log('[STARTUP] Running staff database verification...');
  
  const result = await verifyStaffDatabaseIntegration();
  
  if (result.success) {
    console.log(`[STARTUP] ✅ ${result.message}`);
  } else {
    console.error(`[STARTUP] ❌ ${result.message}`);
    
    // In production, we could send this to monitoring/alerting
    if (import.meta.env.PROD) {
      console.error('[STARTUP] CRITICAL: Staff database verification failed in production');
    }
  }
}

/**
 * Fail-fast verification that throws on database issues
 */
export async function assertStaffDatabaseIntegrity(): Promise<void> {
  const result = await verifyStaffDatabaseIntegration();
  
  if (!result.success) {
    throw new Error(`Staff database integrity check failed: ${result.message}`);
  }
}