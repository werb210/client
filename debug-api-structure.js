/**
 * Debug API Structure - Check actual response format
 */

async function debugAPIStructure() {
  try {
    console.log('🔍 Fetching from staff API...');
    
    const response = await fetch('https://staffportal.replit.app/api/public/lenders', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    
    console.log('📋 Full API Response Structure:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.products && Array.isArray(data.products)) {
      console.log(`📊 Total products: ${data.products.length}`);
      
      if (data.products.length > 0) {
        console.log('📋 First product structure:');
        console.log(JSON.stringify(data.products[0], null, 2));
        
        console.log('🔍 Checking product fields:');
        const firstProduct = data.products[0];
        
        console.log('- id:', typeof firstProduct.id, firstProduct.id);
        console.log('- productName:', typeof firstProduct.productName, firstProduct.productName);
        console.log('- name:', typeof firstProduct.name, firstProduct.name);
        console.log('- lenderName:', typeof firstProduct.lenderName, firstProduct.lenderName);
        console.log('- lender:', typeof firstProduct.lender, firstProduct.lender);
        console.log('- category:', typeof firstProduct.category, firstProduct.category);
        console.log('- amountRange:', typeof firstProduct.amountRange, firstProduct.amountRange);
        console.log('- minAmount:', typeof firstProduct.minAmount, firstProduct.minAmount);
        console.log('- maxAmount:', typeof firstProduct.maxAmount, firstProduct.maxAmount);
        
        console.log('📋 All fields in first product:');
        console.log(Object.keys(firstProduct));
      }
    } else {
      console.error('❌ No products array found in response');
    }
    
  } catch (error) {
    console.error('❌ Error debugging API structure:', error);
  }
}

// Run the debug
debugAPIStructure();