// Debug Baker Garrington Capital products for duplicates and data issues
async function debugBakerGarrington() {
  try {
    const { default: fetch } = await import('node-fetch');
    
    console.log('Fetching products from staff API...');
    const response = await fetch('https://staffportal.replit.app/api/public/lenders');
    const data = await response.json();
    
    if (!data.products) {
      console.error('No products found in API response');
      return;
    }
    
    // Filter Baker Garrington products
    const bakerProducts = data.products.filter(p => 
      p.lenderName && p.lenderName.includes('Baker Garrington')
    );
    
    console.log(`\n=== BAKER GARRINGTON CAPITAL ANALYSIS ===`);
    console.log(`Total Baker Garrington products: ${bakerProducts.length}`);
    
    // Detailed product analysis
    console.log('\n=== DETAILED PRODUCT LIST ===');
    bakerProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. Product Details:`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Name: ${product.productName}`);
      console.log(`   Lender: ${product.lenderName}`);
      console.log(`   Country: ${product.country}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Amount Range: $${product.amountRange?.min || 'N/A'} - $${product.amountRange?.max || 'N/A'}`);
      console.log(`   Interest Rate: ${product.interestRate?.min || 'N/A'}% - ${product.interestRate?.max || 'N/A'}%`);
    });
    
    // Check for duplicates by name
    console.log('\n=== DUPLICATE ANALYSIS ===');
    const nameCount = {};
    bakerProducts.forEach(product => {
      const name = product.productName;
      if (!nameCount[name]) nameCount[name] = 0;
      nameCount[name]++;
    });
    
    const duplicates = Object.entries(nameCount).filter(([name, count]) => count > 1);
    if (duplicates.length > 0) {
      console.log('❌ DUPLICATES FOUND:');
      duplicates.forEach(([name, count]) => {
        console.log(`   "${name}": ${count} instances`);
      });
    } else {
      console.log('✅ No duplicate product names found');
    }
    
    // Check for missing categories
    console.log('\n=== CATEGORY ANALYSIS ===');
    const missingCategory = bakerProducts.filter(p => !p.category || p.category === '');
    if (missingCategory.length > 0) {
      console.log('❌ PRODUCTS WITH MISSING CATEGORIES:');
      missingCategory.forEach(p => {
        console.log(`   ${p.productName} (ID: ${p.id})`);
      });
    } else {
      console.log('✅ All products have categories');
    }
    
    // Check for lender name consistency
    console.log('\n=== LENDER NAME CONSISTENCY ===');
    const lenderNames = [...new Set(bakerProducts.map(p => p.lenderName))];
    console.log('Unique lender names:');
    lenderNames.forEach(name => {
      const count = bakerProducts.filter(p => p.lenderName === name).length;
      console.log(`   "${name}": ${count} products`);
    });
    
    // Country distribution
    console.log('\n=== COUNTRY DISTRIBUTION ===');
    const byCountry = {};
    bakerProducts.forEach(product => {
      const country = product.country || 'UNDEFINED';
      if (!byCountry[country]) byCountry[country] = [];
      byCountry[country].push(product.productName);
    });
    
    Object.keys(byCountry).forEach(country => {
      console.log(`${country}: ${byCountry[country].length} products`);
      byCountry[country].forEach(name => {
        console.log(`  - ${name}`);
      });
    });
    
    // Expected vs Actual
    console.log('\n=== COMPARISON WITH STAFF DATABASE ===');
    console.log('Expected: 6 CA + 1 US = 7 total');
    console.log(`Actual: ${bakerProducts.length} total`);
    
    const actualCA = byCountry['CA'] ? byCountry['CA'].length : 0;
    const actualUS = byCountry['US'] ? byCountry['US'].length : 0;
    console.log(`Country breakdown: ${actualCA} CA + ${actualUS} US`);
    
    if (bakerProducts.length !== 7) {
      console.log('❌ MISMATCH: Product count does not match expected 7');
    } else {
      console.log('✅ MATCH: Product count matches expected 7');
    }
    
  } catch (error) {
    console.error('Error debugging Baker Garrington products:', error.message);
  }
}

debugBakerGarrington();