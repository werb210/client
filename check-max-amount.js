/**
 * Check Maximum Lending Amount - Find the highest funding amount available
 */

async function checkMaxAmount() {
  console.log('💰 Checking Maximum Lending Amounts\n');
  
  try {
    const response = await fetch('https://staff.boreal.financial/api/public/lenders');
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    if (!data.success || !data.products) {
      throw new Error('Invalid API response structure');
    }
    
    const products = data.products;
    console.log(`📊 Analyzing ${products.length} total products\n`);
    
    // Find maximum amounts
    const maxAmounts = products.map(p => p.amountMax).sort((a, b) => b - a);
    const absoluteMax = maxAmounts[0];
    
    console.log(`🏆 MAXIMUM FUNDING AMOUNT: $${absoluteMax.toLocaleString()}`);
    
    // Find products with the highest amounts
    const topProducts = products
      .filter(p => p.amountMax >= 10000000) // $10M+
      .sort((a, b) => b.amountMax - a.amountMax);
    
    console.log('\n🔝 TOP FUNDING PRODUCTS ($10M+):');
    topProducts.forEach(p => {
      console.log(`   ${p.lenderName}: ${p.name}`);
      console.log(`   └─ ${p.category} | ${p.country} | $${p.amountMin.toLocaleString()} - $${p.amountMax.toLocaleString()}`);
    });
    
    // Summary by ranges
    const ranges = {
      'Under $100K': products.filter(p => p.amountMax < 100000).length,
      '$100K - $1M': products.filter(p => p.amountMax >= 100000 && p.amountMax < 1000000).length,
      '$1M - $10M': products.filter(p => p.amountMax >= 1000000 && p.amountMax < 10000000).length,
      '$10M+': products.filter(p => p.amountMax >= 10000000).length
    };
    
    console.log('\n📈 FUNDING RANGE DISTRIBUTION:');
    Object.entries(ranges).forEach(([range, count]) => {
      console.log(`   ${range}: ${count} products`);
    });
    
    // By country
    const byCountry = {
      US: products.filter(p => p.country === 'US'),
      CA: products.filter(p => p.country === 'CA')
    };
    
    console.log('\n🌍 MAXIMUM BY COUNTRY:');
    Object.entries(byCountry).forEach(([country, countryProducts]) => {
      const countryMax = Math.max(...countryProducts.map(p => p.amountMax));
      console.log(`   ${country}: $${countryMax.toLocaleString()} (${countryProducts.length} products)`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check
checkMaxAmount();