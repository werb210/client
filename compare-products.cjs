// Compare staff database with client-side data
async function compareProducts() {
  try {
    const { default: fetch } = await import('node-fetch');
    
    console.log('Fetching client-side data from staff API...');
    const response = await fetch('https://staffportal.replit.app/api/public/lenders');
    const data = await response.json();
    
    if (!data.products) {
      console.error('No products found in API response');
      return;
    }
    
    console.log(`\n=== CLIENT-SIDE DATA ANALYSIS ===`);
    console.log(`Total products: ${data.products.length}`);
    
    // Group by country
    const byCountry = {};
    data.products.forEach(product => {
      const country = product.country || 'UNDEFINED';
      if (!byCountry[country]) byCountry[country] = [];
      byCountry[country].push(product);
    });
    
    console.log('\nCountry distribution:');
    Object.keys(byCountry).forEach(country => {
      console.log(`  ${country}: ${byCountry[country].length} products`);
    });
    
    // Group by lender
    const byLender = {};
    data.products.forEach(product => {
      const lender = product.lenderName || 'UNKNOWN';
      if (!byLender[lender]) byLender[lender] = [];
      byLender[lender].push(product);
    });
    
    console.log('\nLender distribution:');
    Object.keys(byLender).sort().forEach(lender => {
      console.log(`  ${lender}: ${byLender[lender].length} products`);
    });
    
    // Category distribution
    const byCategory = {};
    data.products.forEach(product => {
      const category = product.category || 'UNKNOWN';
      if (!byCategory[category]) byCategory[category] = 0;
      byCategory[category]++;
    });
    
    console.log('\nCategory distribution:');
    Object.keys(byCategory).sort().forEach(category => {
      console.log(`  ${category}: ${byCategory[category]} products`);
    });
    
    // Canadian products analysis
    console.log('\n=== CANADIAN PRODUCTS DETAILED ===');
    const canadianProducts = byCountry['CA'] || [];
    canadianProducts.forEach((product, index) => {
      const min = product.amountRange?.min || 'N/A';
      const max = product.amountRange?.max || 'N/A';
      console.log(`${index + 1}. ${product.productName} - ${product.lenderName}`);
      console.log(`   Category: ${product.category}, Range: $${min}-$${max}`);
    });
    
    // US products analysis  
    console.log('\n=== US PRODUCTS DETAILED ===');
    const usProducts = byCountry['US'] || [];
    usProducts.forEach((product, index) => {
      const min = product.amountRange?.min || 'N/A';
      const max = product.amountRange?.max || 'N/A';
      console.log(`${index + 1}. ${product.productName} - ${product.lenderName}`);
      console.log(`   Category: ${product.category}, Range: $${min}-$${max}`);
    });
    
    // Expected vs Actual comparison
    console.log('\n=== COMPARISON WITH STAFF DATABASE ===');
    console.log('Expected (Staff): 22 CA + 20 US = 42 total');
    console.log(`Actual (Client):  ${canadianProducts.length} CA + ${usProducts.length} US = ${data.products.length} total`);
    
    const expectedCA = 22;
    const expectedUS = 20;
    const actualCA = canadianProducts.length;
    const actualUS = usProducts.length;
    
    if (actualCA === expectedCA && actualUS === expectedUS) {
      console.log('✅ MATCH: Product counts match staff database');
    } else {
      console.log('❌ MISMATCH: Product counts do not match staff database');
      if (actualCA !== expectedCA) console.log(`  CA difference: Expected ${expectedCA}, Got ${actualCA}`);
      if (actualUS !== expectedUS) console.log(`  US difference: Expected ${expectedUS}, Got ${actualUS}`);
    }
    
  } catch (error) {
    console.error('Error comparing products:', error.message);
  }
}

compareProducts();