/**
 * COMPREHENSIVE STEP 2 DEBUG TEST
 * Run this in browser console to trace complete data flow
 */

async function runStep2DebugTest() {
  console.log('=== COMPREHENSIVE STEP 2 DEBUG TEST ===\n');
  
  // Test 1: Check Form Data Context State
  console.log('✅ 1. Form Data Context State:');
  const context = window.formDataContext || {};
  console.log('Full context state:', context.state);
  console.log('Step 1 data:', context.state?.step1);
  console.log('Step 2 data:', context.state?.step2);
  console.log('');
  
  // Test 2: Check IndexedDB Cache
  console.log('✅ 2. IndexedDB Cache Check:');
  try {
    const { loadLenderProducts } = await import('./src/utils/lenderCache.js');
    const cachedProducts = await loadLenderProducts();
    console.log('Cached products count:', cachedProducts?.length || 0);
    if (cachedProducts?.length > 0) {
      console.log('Sample product:', cachedProducts[0]);
      console.log('Product fields:', Object.keys(cachedProducts[0]));
    }
  } catch (error) {
    console.error('Error loading cache:', error);
  }
  console.log('');
  
  // Test 3: Check useProductCategories Hook State
  console.log('✅ 3. useProductCategories Hook Simulation:');
  try {
    const formData = {
      headquarters: context.state?.step1?.headquarters || 'CA',
      industry: context.state?.step1?.industry || 'transportation',
      lookingFor: context.state?.step1?.lookingFor || 'capital',
      fundingAmount: context.state?.step1?.fundingAmount || 45000,
      fundsPurpose: context.state?.step1?.fundsPurpose || 'working_capital',
      accountsReceivableBalance: context.state?.step1?.accountsReceivableBalance || 0
    };
    
    console.log('Form data for filtering:', formData);
    
    // Test filtering manually
    const { loadLenderProducts } = await import('./src/utils/lenderCache.js');
    const products = await loadLenderProducts() || [];
    
    if (products.length > 0) {
      console.log('Available products:', products.length);
      
      // Check country distribution
      const countryStats = products.reduce((acc, p) => {
        const country = p.country || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {});
      console.log('Products by country:', countryStats);
      
      // Test amount filtering
      const amountMatches = products.filter(p => {
        const maxAmount = p.max_amount || p.maxAmount || 0;
        return formData.fundingAmount <= maxAmount;
      });
      console.log('Products matching $45K amount:', amountMatches.length);
      
      // Test country filtering  
      const countryMatches = products.filter(p => p.country === formData.headquarters);
      console.log(`Products in ${formData.headquarters}:`, countryMatches.length);
      
      // Combined filtering
      const matches = products.filter(p => {
        const maxAmount = p.max_amount || p.maxAmount || 0;
        return formData.fundingAmount <= maxAmount && p.country === formData.headquarters;
      });
      console.log('Combined matches:', matches.length);
      
      if (matches.length > 0) {
        console.log('Sample match:', {
          name: matches[0].name,
          country: matches[0].country,
          category: matches[0].category,
          maxAmount: matches[0].max_amount || matches[0].maxAmount
        });
      }
    }
  } catch (error) {
    console.error('Error in filtering simulation:', error);
  }
  console.log('');
  
  // Test 4: Check React Query State
  console.log('✅ 4. React Query State Check:');
  try {
    const queryClient = window.queryClient;
    if (queryClient) {
      const queries = queryClient.getQueryCache().getAll();
      console.log('Active queries:', queries.length);
      
      const productQueries = queries.filter(q => 
        q.queryKey.some(key => 
          typeof key === 'string' && 
          (key.includes('product') || key.includes('lender'))
        )
      );
      console.log('Product-related queries:', productQueries.length);
      
      productQueries.forEach(q => {
        console.log('Query:', q.queryKey, 'State:', q.state.status, 'Error:', q.state.error);
      });
    }
  } catch (error) {
    console.error('Error checking React Query:', error);
  }
  
  console.log('\n=== TEST COMPLETE ===');
  
  return {
    hasStep1Data: !!(context.state?.step1),
    hasProducts: true, // Will be updated by async check
    contextWorking: !!context.state,
    timestamp: new Date().toISOString()
  };
}

// Make available globally
window.runStep2DebugTest = runStep2DebugTest;

// Also provide form data context access
window.formDataContext = window.formDataContext || {};