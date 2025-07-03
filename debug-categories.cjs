// Debug category names in normalized data
async function debugCategories() {
  try {
    const { default: fetch } = await import('node-fetch');
    
    console.log('Fetching products from staff API...');
    const response = await fetch('https://staffportal.replit.app/api/public/lenders');
    const data = await response.json();
    
    if (!data.products) {
      console.error('No products found in API response');
      return;
    }
    
    // Get unique categories
    const categories = [...new Set(data.products.map(p => p.category))];
    console.log('\n=== ACTUAL CATEGORY NAMES IN NORMALIZED DATA ===');
    categories.forEach(cat => {
      const count = data.products.filter(p => p.category === cat).length;
      console.log(`${cat}: ${count} products`);
    });
    
    // Check Canadian products specifically
    const canadianProducts = data.products.filter(p => p.country === 'CA');
    console.log('\n=== CANADIAN PRODUCTS BY CATEGORY ===');
    const canadianCategories = [...new Set(canadianProducts.map(p => p.category))];
    canadianCategories.forEach(cat => {
      const count = canadianProducts.filter(p => p.category === cat).length;
      console.log(`${cat}: ${count} products`);
    });
    
    // Check what should match "business capital"
    console.log('\n=== BUSINESS CAPITAL MATCHING ANALYSIS ===');
    const capitalCategories = [
      'Working Capital',
      'Business Line of Credit', 
      'Term Loan',
      'Business Term Loan',
      'SBA Loan',
      'Asset Based Lending',
      'Invoice Factoring',
      'Purchase Order Financing'
    ];
    
    console.log('Expected categories to match business capital:');
    capitalCategories.forEach(cat => console.log(`  - ${cat}`));
    
    console.log('\nActual categories in data:');
    categories.forEach(cat => console.log(`  - ${cat}`));
    
    // Test matching logic
    console.log('\n=== MATCHING TEST ===');
    categories.forEach(actualCat => {
      const isMatch = capitalCategories.some(expectedCat => 
        actualCat.toLowerCase().includes(expectedCat.toLowerCase()) ||
        expectedCat.toLowerCase().includes(actualCat.toLowerCase())
      );
      console.log(`${actualCat}: ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    });
    
  } catch (error) {
    console.error('Error debugging categories:', error.message);
  }
}

debugCategories();