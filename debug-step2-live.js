/**
 * LIVE STEP 2 DEBUGGING
 * Run this in browser console while on Step 2 to see exactly what's happening
 */

async function debugStep2Live() {
  console.log('=== STEP 2 LIVE DEBUG ===');
  
  // Check if we're on the right page
  console.log('Current URL:', window.location.href);
  console.log('Current path:', window.location.pathname);
  
  // Test the API endpoint directly
  try {
    console.log('Testing /api/public/lenders endpoint...');
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    console.log('API Response:', {
      status: response.status,
      ok: response.ok,
      productCount: data.products?.length || 0,
      firstProduct: data.products?.[0]
    });
    
    if (data.products && data.products.length > 0) {
      const sample = data.products[0];
      console.log('Sample product structure:', {
        id: sample.id,
        name: sample.name,
        category: sample.category,
        minAmount: sample.minAmount,
        maxAmount: sample.maxAmount,
        geography: sample.geography
      });
    }
  } catch (error) {
    console.error('API call failed:', error);
  }
  
  // Test the recommendation logic with sample form data
  const testFormData = {
    headquarters: 'US',
    fundingAmount: 50000,
    lookingFor: 'capital',
    accountsReceivableBalance: 0,
    fundsPurpose: 'working_capital'
  };
  
  console.log('Test form data:', testFormData);
  
  // Check if useProductCategories is being called
  console.log('Looking for Step 2 component in DOM...');
  const step2Elements = document.querySelectorAll('[data-testid*="step2"], [class*="step2"], [class*="recommendation"]');
  console.log('Found Step 2 elements:', step2Elements.length);
  
  // Check for any error messages
  const errorElements = document.querySelectorAll('[class*="error"], [role="alert"]');
  console.log('Found error elements:', errorElements.length);
  errorElements.forEach((el, i) => {
    console.log(`Error ${i}:`, el.textContent);
  });
  
  // Check React Query cache
  if (window.__REACT_QUERY_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('React Query detected - checking cache...');
  }
  
  console.log('=== END DEBUG ===');
}

// Run the debug
debugStep2Live();