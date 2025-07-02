// Debug script to examine the actual data structure from the staff API
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://staffportal.replit.app/api';

async function debugLenderData() {
  try {
    const response = await fetch(`${API_BASE_URL}/public/lenders`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('=== RAW API RESPONSE STRUCTURE ===');
    console.log('Response type:', typeof data);
    console.log('Is Array:', Array.isArray(data));
    
    if (Array.isArray(data)) {
      console.log('Array length:', data.length);
    } else {
      console.log('Response keys:', Object.keys(data));
    }

    const products = Array.isArray(data) ? data : data.products || [];
    console.log('\n=== FIRST PRODUCT ANALYSIS ===');
    if (products.length > 0) {
      const firstProduct = products[0];
      console.log('First product keys:', Object.keys(firstProduct));
      console.log('Full first product:');
      console.log(JSON.stringify(firstProduct, null, 2));
    }

    console.log('\n=== FIELD ANALYSIS (First 5 Products) ===');
    products.slice(0, 5).forEach((product, idx) => {
      console.log(`\nProduct ${idx + 1}:`);
      console.log('  All fields:', Object.keys(product));
      
      // Check all possible name variations
      console.log('  Name fields:');
      console.log('    product_name:', product.product_name);
      console.log('    productName:', product.productName);
      console.log('    name:', product.name);
      
      // Check all possible amount variations  
      console.log('  Amount fields:');
      console.log('    min_amount:', product.min_amount);
      console.log('    minAmount:', product.minAmount);
      console.log('    max_amount:', product.max_amount);
      console.log('    maxAmount:', product.maxAmount);
      
      // Check all possible type variations
      console.log('  Type fields:');
      console.log('    product_type:', product.product_type);
      console.log('    productType:', product.productType);
      console.log('    type:', product.type);
      
      // Check geography
      console.log('  Geography:', product.geography);
      
      // Check description for embedded data
      console.log('  Description:', product.description);
    });

    // Try to extract embedded data from description
    console.log('\n=== DESCRIPTION PARSING ANALYSIS ===');
    const firstProduct = products[0];
    if (firstProduct && firstProduct.description) {
      const desc = firstProduct.description;
      console.log('Sample description:', desc);
      
      // Try to parse embedded data
      const typeMatch = desc.match(/^(\w+)/);
      const rateMatch = desc.match(/Rate: (\d+)% - (\d+)%/);
      const termMatch = desc.match(/(\d+)-(\d+) months/);
      
      console.log('Parsed type:', typeMatch ? typeMatch[1] : 'not found');
      console.log('Parsed rate range:', rateMatch ? `${rateMatch[1]}% - ${rateMatch[2]}%` : 'not found');
      console.log('Parsed term range:', termMatch ? `${termMatch[1]}-${termMatch[2]} months` : 'not found');
    }

  } catch (error) {
    console.error('Debug error:', error.message);
  }
}

debugLenderData();