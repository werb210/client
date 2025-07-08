/**
 * Debug Landing Page API Call
 */

async function debugLandingAPI() {
  console.log('🔍 Debugging Landing Page API Call\n');
  
  // Test the exact URL that landing page is using
  const baseUrl = 'https://staff.boreal.financial/api';
  const fullUrl = `${baseUrl}/public/lenders`;
  
  console.log('Testing URL:', fullUrl);
  
  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    console.log('Response status:', response.status, response.statusText);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success! Data structure:', {
        success: data.success,
        productCount: data.products?.length || 0,
        hasProducts: !!data.products,
        maxAmount: data.products ? Math.max(...data.products.map(p => p.amountMax || 0)) : 0
      });
      
      if (data.products && data.products.length > 0) {
        const maxAmount = Math.max(...data.products.map(p => p.amountMax || 0));
        console.log(`✅ Maximum funding found: $${maxAmount.toLocaleString()}`);
        
        if (maxAmount >= 1000000) {
          const millions = maxAmount / 1000000;
          if (millions >= 10) {
            console.log(`✅ Display format: $${Math.floor(millions)}M+`);
          } else {
            console.log(`✅ Display format: $${millions.toFixed(1)}M+`);
          }
        }
      }
    } else {
      console.error('❌ API Error:', response.status, response.statusText);
      const text = await response.text();
      console.log('Response body:', text);
    }
  } catch (error) {
    console.error('❌ Fetch Error:', error.message);
  }
}

// Run the debug
debugLandingAPI();