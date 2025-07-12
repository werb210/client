/**
 * BROWSER CONSOLE TEST - Find all Canadian products for $100K capital
 * Copy and paste this into the browser console on the application page
 */

async function debugCanadianProducts() {
  console.log('=== DEBUGGING CANADIAN PRODUCTS FOR $100K CAPITAL REQUEST ===');
  
  try {
    // Import the cache utility
    const { loadLenderProducts } = await import('./src/utils/lenderCache.js');
    const products = await loadLenderProducts();
    
    console.log(`\n📊 Total products in cache: ${products.length}`);
    
    // Show sample product structure
    if (products.length > 0) {
      console.log('\n🔍 Sample product structure:');
      console.log('Product 1:', products[0]);
      console.log('Product 1 fields:', Object.keys(products[0]));
    }
    
    // Analyze geography/country fields across ALL products
    console.log('\n🌍 GEOGRAPHY ANALYSIS:');
    const geographyVariations = new Set();
    const countryVariations = new Set();
    
    products.forEach(p => {
      if (p.geography) geographyVariations.add(JSON.stringify(p.geography));
      if (p.country) countryVariations.add(p.country);
    });
    
    console.log('Geography field variations:', Array.from(geographyVariations));
    console.log('Country field variations:', Array.from(countryVariations));
    
    // Find ALL products that mention Canada in ANY field
    const canadianProducts = products.filter(p => {
      const productStr = JSON.stringify(p).toLowerCase();
      return productStr.includes('ca') || 
             productStr.includes('canada') ||
             p.country === 'CA' ||
             p.country === 'US/CA' ||
             p.country === 'CA/US' ||
             (Array.isArray(p.geography) && p.geography.includes('CA'));
    });
    
    console.log(`\n🇨🇦 Products mentioning Canada: ${canadianProducts.length}`);
    
    canadianProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name || product.lender}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Country: ${product.country}`);
      console.log(`   Geography: ${JSON.stringify(product.geography)}`);
      
      // Check ALL possible amount field names
      const amountFields = Object.keys(product).filter(key => 
        key.toLowerCase().includes('amount') || 
        key.toLowerCase().includes('min') || 
        key.toLowerCase().includes('max')
      );
      console.log(`   Amount fields:`, amountFields.map(f => `${f}: ${product[f]}`));
    });
    
    // Test the actual filtering logic that's being used
    console.log('\n🔧 TESTING ACTUAL FILTERING LOGIC:');
    
    const testForm = {
      headquarters: 'CA',
      fundingAmount: 100000,
      lookingFor: 'capital',
      accountsReceivableBalance: 0,
      fundsPurpose: 'working_capital'
    };
    
    // Import and test the actual filtering function
    const { filterProducts } = await import('./src/lib/recommendation.js');
    const filteredResults = filterProducts(products, testForm);
    
    console.log(`\nFiltered results: ${filteredResults.length} products`);
    filteredResults.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name || product.lender} (${product.category})`);
    });
    
    // Check why other products are being excluded
    console.log('\n❌ EXCLUSION ANALYSIS - Why products are filtered out:');
    
    products.slice(0, 10).forEach(product => {
      const minAmount = product.minAmount ?? product.amountMin ?? product.amount_min ?? product.min_amount ?? 0;
      const maxAmount = product.maxAmount ?? product.amountMax ?? product.amount_max ?? product.max_amount ?? Infinity;
      
      const geography = product.geography ?? product.countries ?? product.markets ?? product.country;
      const geoArray = Array.isArray(geography) ? geography : (geography ? [geography] : []);
      
      const geographyMatch = geoArray.includes('CA') || 
                            geoArray.includes('US/CA') || 
                            geoArray.includes('CA/US') ||
                            geoArray.includes('Canada');
      
      const min = typeof minAmount === 'string' ? parseFloat(minAmount.replace(/[^0-9.-]/g, '')) || 0 : minAmount;
      const max = typeof maxAmount === 'string' ? parseFloat(maxAmount.replace(/[^0-9.-]/g, '')) || Infinity : maxAmount;
      const amountMatch = 100000 >= min && 100000 <= max;
      
      const categoryLower = product.category?.toLowerCase() || '';
      const typeMatch = !categoryLower.includes('equipment');
      
      console.log(`\n${product.name || product.lender}:`);
      console.log(`  Geography: ${JSON.stringify(geoArray)} → Match: ${geographyMatch}`);
      console.log(`  Amount: ${min}-${max} → Match: ${amountMatch}`);
      console.log(`  Category: ${product.category} → Match: ${typeMatch}`);
      console.log(`  Overall: ${geographyMatch && amountMatch && typeMatch ? '✅ PASS' : '❌ FAIL'}`);
    });
    
  } catch (error) {
    console.error('Error analyzing Canadian products:', error);
  }
}

// Run the analysis
debugCanadianProducts();