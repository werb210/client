/**
 * Check Current Lender Products Count
 * Quick verification of how many products are available in the system
 */

async function checkProductsCount() {
  try {
    console.log('🔍 Checking lender products count...');
    
    const response = await fetch('https://staff.boreal.financial/api/public/lenders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ API Response Structure:', Object.keys(data));
    
    const products = data.products || [];
    console.log(`\n📊 LENDER PRODUCTS COUNT: ${products.length}`);
    
    if (products.length > 0) {
      console.log('\n📋 Product Categories:');
      const categories = [...new Set(products.map(p => p.category))];
      categories.forEach(cat => {
        const count = products.filter(p => p.category === cat).length;
        console.log(`  - ${cat}: ${count} products`);
      });
      
      console.log('\n🌎 Geographic Coverage:');
      const countries = [...new Set(products.map(p => p.geography))];
      countries.forEach(country => {
        const count = products.filter(p => p.geography === country).length;
        console.log(`  - ${country}: ${count} products`);
      });
      
      console.log('\n💰 Funding Range:');
      const amounts = products.map(p => p.amountMax || 0).filter(a => a > 0);
      if (amounts.length > 0) {
        const maxFunding = Math.max(...amounts);
        const minFunding = Math.min(...amounts);
        console.log(`  - Range: $${minFunding.toLocaleString()} - $${maxFunding.toLocaleString()}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking products:', error.message);
  }
}

checkProductsCount();