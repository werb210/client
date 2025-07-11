/**
 * Debug usePublicLenders Hook Response Format
 * Run this in browser console to see exact data structure being returned
 */

async function debugUsePublicLendersData() {
  try {
    console.log('[DEBUG] Testing /api/public/lenders endpoint directly...');
    
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    console.log('[DEBUG] API Response Status:', response.status);
    console.log('[DEBUG] API Response Headers:', Object.fromEntries(response.headers.entries()));
    console.log('[DEBUG] Full API Response:', data);
    
    if (data.products && data.products.length > 0) {
      const firstProduct = data.products[0];
      console.log('[DEBUG] First Product Structure:', firstProduct);
      console.log('[DEBUG] First Product Keys:', Object.keys(firstProduct));
      console.log('[DEBUG] Product Type Field:', firstProduct.product_type);
      console.log('[DEBUG] Amount Fields:', {
        min_amount: firstProduct.min_amount,
        max_amount: firstProduct.max_amount,
        amountMin: firstProduct.amountMin,
        amountMax: firstProduct.amountMax
      });
      console.log('[DEBUG] Geography Field:', firstProduct.geography);
    }
    
    // Test the recommendation logic
    console.log('[DEBUG] Testing recommendation logic...');
    
    const testFormData = {
      headquarters: 'CA',
      fundingAmount: 50000,
      lookingFor: 'capital',
      accountsReceivableBalance: 25000,
      fundsPurpose: 'working_capital'
    };
    
    console.log('[DEBUG] Test Form Data:', testFormData);
    
    if (data.products) {
      // Test filtering with staff data structure
      const filteredProducts = data.products.filter(product => {
        console.log('[DEBUG] Testing product:', product.name || product.product_name, {
          geography: product.geography,
          min_amount: product.min_amount,
          max_amount: product.max_amount,
          product_type: product.product_type
        });
        return true; // Just log for now
      });
      
      console.log('[DEBUG] All products passed through filter');
    }
    
  } catch (error) {
    console.error('[DEBUG] Error testing usePublicLenders data:', error);
  }
}

// Run the test
debugUsePublicLendersData();