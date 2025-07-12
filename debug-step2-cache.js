/**
 * STEP 2 CACHE DEBUG SCRIPT
 * Run this in browser console to debug why Step 2 shows zero products
 */

async function debugStep2Cache() {
  console.log('🔍 STEP 2 CACHE DEBUG - Starting comprehensive analysis...');
  
  // 1. Check IndexedDB Cache
  console.log('\n1️⃣ Checking IndexedDB Cache...');
  try {
    const { get } = await import('idb-keyval');
    const cachedProducts = await get('lender-products');
    const cacheMetadata = await get('lender-cache-metadata');
    
    console.log('✅ IndexedDB Results:', {
      cachedProductCount: cachedProducts?.length || 0,
      cacheMetadata: cacheMetadata,
      hasValidCache: !!cachedProducts && cachedProducts.length > 0
    });
    
    if (!cachedProducts || cachedProducts.length === 0) {
      console.error('❌ CRITICAL: No products in IndexedDB cache!');
      return false;
    }
  } catch (error) {
    console.error('❌ IndexedDB Error:', error);
    return false;
  }
  
  // 2. Test fetchLenderProducts function
  console.log('\n2️⃣ Testing fetchLenderProducts function...');
  try {
    const { fetchLenderProducts } = await import('./src/api/lenderProducts.ts');
    const products = await fetchLenderProducts();
    console.log('✅ fetchLenderProducts result:', {
      productCount: products.length,
      firstProduct: products[0]?.name,
      countries: [...new Set(products.map(p => p.country))]
    });
    
    if (products.length === 0) {
      console.error('❌ CRITICAL: fetchLenderProducts returns empty array!');
      return false;
    }
  } catch (error) {
    console.error('❌ fetchLenderProducts Error:', error);
    return false;
  }
  
  // 3. Test usePublicLenders hook simulation
  console.log('\n3️⃣ Testing usePublicLenders hook...');
  try {
    const { loadLenderProducts } = await import('./src/utils/lenderCache.ts');
    const hookResult = await loadLenderProducts();
    console.log('✅ usePublicLenders simulation:', {
      productCount: hookResult?.length || 0,
      sampleProduct: hookResult?.[0]
    });
  } catch (error) {
    console.error('❌ usePublicLenders simulation Error:', error);
  }
  
  // 4. Test filtering logic with sample form data
  console.log('\n4️⃣ Testing filtering logic...');
  try {
    const sampleFormData = {
      headquarters: 'US',
      lookingFor: 'capital',
      fundingAmount: 100000,
      accountsReceivableBalance: 50000,
      fundsPurpose: 'business_expansion'
    };
    
    const { useProductCategories } = await import('./src/hooks/useProductCategories.ts');
    console.log('✅ Sample form data for filtering:', sampleFormData);
    console.log('⚠️ Note: useProductCategories would need to be tested in React context');
  } catch (error) {
    console.error('❌ Filtering test Error:', error);
  }
  
  // 5. Check for any remaining API calls
  console.log('\n5️⃣ Monitoring network activity...');
  const originalFetch = window.fetch;
  let apiCallCount = 0;
  
  window.fetch = function(...args) {
    apiCallCount++;
    console.warn('🚨 API Call detected:', args[0]);
    return originalFetch.apply(this, args);
  };
  
  setTimeout(() => {
    window.fetch = originalFetch;
    console.log(`📊 Total API calls in 10 seconds: ${apiCallCount}`);
    if (apiCallCount > 0) {
      console.error('❌ CRITICAL: API calls still being made in cache-only mode!');
    } else {
      console.log('✅ No API calls detected - cache-only mode working');
    }
  }, 10000);
  
  console.log('🎯 Debug complete. Check results above.');
  return true;
}

// Auto-run debug
debugStep2Cache();