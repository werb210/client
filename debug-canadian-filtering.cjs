const https = require('https');

async function debugCanadianFiltering() {
  console.log('🔍 DEBUGGING CANADIAN BUSINESS FILTERING ISSUE');
  console.log('==============================================');
  console.log('Scenario: Canadian Manufacturing, $40,000 Business Capital\n');
  
  // Fetch all products first
  const products = await fetchProducts();
  console.log(`📊 Total products fetched: ${products.length}\n`);
  
  // Analyze geographic distribution
  const geographyAnalysis = {};
  products.forEach(product => {
    const geography = product.geography || ['US'];
    geography.forEach(country => {
      geographyAnalysis[country] = (geographyAnalysis[country] || 0) + 1;
    });
  });
  
  console.log('🌍 GEOGRAPHIC DISTRIBUTION:');
  Object.entries(geographyAnalysis).forEach(([country, count]) => {
    console.log(`   ${country}: ${count} products`);
  });
  console.log('');
  
  // Check Canadian products specifically
  const canadianProducts = products.filter(p => {
    const geography = p.geography || ['US'];
    return geography.includes('CA');
  });
  
  console.log(`🇨🇦 CANADIAN PRODUCTS: ${canadianProducts.length}`);
  canadianProducts.forEach(product => {
    const minAmount = parseFloat(product.amountRange?.min || product.minAmount || 0);
    const maxAmount = parseFloat(product.amountRange?.max || product.maxAmount || 999999);
    console.log(`   • ${product.productName || product.name} (${product.lenderName})`);
    console.log(`     Range: $${minAmount.toLocaleString()} - $${maxAmount.toLocaleString()}`);
    console.log(`     Category: ${product.category || product.product_type}`);
    console.log(`     Geography: ${(product.geography || ['US']).join(', ')}`);
  });
  console.log('');
  
  // Test the exact filtering logic
  const testScenario = {
    country: 'canada',
    lookingFor: 'capital',
    fundingAmount: 40000,
    industry: 'manufacturing'
  };
  
  console.log('🎯 TESTING FILTER LOGIC:');
  console.log(`   Country: ${testScenario.country}`);
  console.log(`   Looking for: ${testScenario.lookingFor}`);
  console.log(`   Amount: $${testScenario.fundingAmount.toLocaleString()}`);
  console.log('');
  
  const matches = products.filter(product => {
    const geography = product.geography || ['US'];
    const minAmount = parseFloat(product.amountRange?.min || product.minAmount || 0);
    const maxAmount = parseFloat(product.amountRange?.max || product.maxAmount || 999999);
    const category = (product.category || product.product_type || '').toLowerCase();
    
    console.log(`   Checking: ${product.productName || product.name}`);
    console.log(`     Geography: ${geography.join(', ')} (includes CA: ${geography.includes('CA')})`);
    console.log(`     Amount range: $${minAmount} - $${maxAmount} (40000 in range: ${40000 >= minAmount && 40000 <= maxAmount})`);
    console.log(`     Category: ${category} (not equipment: ${!category.includes('equipment')})`);
    
    // Geography filter
    if (!geography.includes('CA')) {
      console.log(`     ❌ FAILED: Geography filter`);
      return false;
    }
    
    // Amount filter
    if (40000 < minAmount || 40000 > maxAmount) {
      console.log(`     ❌ FAILED: Amount filter`);
      return false;
    }
    
    // Product type filter (capital = not equipment)
    if (category.includes('equipment')) {
      console.log(`     ❌ FAILED: Product type filter (equipment excluded for capital)`);
      return false;
    }
    
    console.log(`     ✅ PASSED: All filters`);
    return true;
  });
  
  console.log(`\n🎯 FILTER RESULTS: ${matches.length} matches`);
  matches.forEach(match => {
    console.log(`   ✅ ${match.productName || match.name} (${match.lenderName})`);
  });
  
  if (matches.length === 0) {
    console.log('\n❗ PROBLEM ANALYSIS:');
    console.log('   1. Are there Canadian products? ' + (canadianProducts.length > 0 ? 'YES' : 'NO'));
    console.log('   2. Are amounts in range? ' + (canadianProducts.some(p => {
      const min = parseFloat(p.amountRange?.min || p.minAmount || 0);
      const max = parseFloat(p.amountRange?.max || p.maxAmount || 999999);
      return 40000 >= min && 40000 <= max;
    }) ? 'YES' : 'NO'));
    console.log('   3. Are there non-equipment products? ' + (canadianProducts.some(p => {
      const cat = (p.category || p.product_type || '').toLowerCase();
      return !cat.includes('equipment');
    }) ? 'YES' : 'NO'));
  }
}

function fetchProducts() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'staffportal.replit.app',
      port: 443,
      path: '/api/public/lenders',
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response.products || []);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

debugCanadianFiltering().catch(console.error);