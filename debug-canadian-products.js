/**
 * Debug Canadian Products - Find all products that should match CA $100K capital request
 */

async function debugCanadianProducts() {
  console.log('=== DEBUGGING CANADIAN PRODUCTS FOR $100K CAPITAL REQUEST ===');
  
  try {
    // Get cached products
    const { loadLenderProducts } = await import('./client/src/utils/lenderCache.js');
    const products = await loadLenderProducts();
    
    console.log(`\n📊 Total products in cache: ${products.length}`);
    
    // Analyze all products for Canadian availability
    const canadianProducts = products.filter(p => {
      const country = p.country || '';
      const geography = p.geography || [];
      
      // Check if product is available in Canada
      return country === 'CA' || 
             country === 'US/CA' || 
             country === 'CA/US' ||
             country.includes('CA') ||
             (Array.isArray(geography) && geography.includes('CA')) ||
             (Array.isArray(geography) && geography.includes('Canada'));
    });
    
    console.log(`\n🇨🇦 Products available in Canada: ${canadianProducts.length}`);
    
    // Show all Canadian products with details
    canadianProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name || product.lender}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Country: ${product.country}`);
      console.log(`   Geography: ${JSON.stringify(product.geography)}`);
      console.log(`   Amount Range: ${product.minAmount || product.amountMin || 0} - ${product.maxAmount || product.amountMax || 'No limit'}`);
      console.log(`   Fields available:`, Object.keys(product));
    });
    
    // Check products that should match $100K capital request
    const matchingProducts = canadianProducts.filter(product => {
      const minAmount = product.minAmount ?? product.amountMin ?? 0;
      const maxAmount = product.maxAmount ?? product.amountMax ?? Infinity;
      
      // Convert string amounts to numbers if needed
      const min = typeof minAmount === 'string' ? parseFloat(minAmount.replace(/[^0-9.-]/g, '')) || 0 : minAmount;
      const max = typeof maxAmount === 'string' ? parseFloat(maxAmount.replace(/[^0-9.-]/g, '')) || Infinity : maxAmount;
      
      // Check if $100,000 fits in range
      const amountMatch = 100000 >= min && 100000 <= max;
      
      // Check if it's a capital product (not equipment)
      const isCapital = !product.category?.toLowerCase().includes('equipment');
      
      return amountMatch && isCapital;
    });
    
    console.log(`\n💰 Canadian products matching $100K capital request: ${matchingProducts.length}`);
    
    matchingProducts.forEach((product, index) => {
      console.log(`\n✅ MATCH ${index + 1}: ${product.name || product.lender}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Country: ${product.country}`);
      console.log(`   Min Amount: ${product.minAmount ?? product.amountMin ?? 'Not set'}`);
      console.log(`   Max Amount: ${product.maxAmount ?? product.amountMax ?? 'Not set'}`);
    });
    
    // Check field name variations across all products
    console.log('\n🔍 FIELD NAME ANALYSIS:');
    const allFieldNames = new Set();
    products.forEach(p => {
      Object.keys(p).forEach(key => allFieldNames.add(key));
    });
    
    console.log('All field names found:', Array.from(allFieldNames).sort());
    
    // Check amount field variations specifically
    const amountFields = Array.from(allFieldNames).filter(field => 
      field.toLowerCase().includes('amount') || 
      field.toLowerCase().includes('min') || 
      field.toLowerCase().includes('max')
    );
    console.log('Amount-related fields:', amountFields);
    
    // Check geography field variations
    const geoFields = Array.from(allFieldNames).filter(field => 
      field.toLowerCase().includes('geo') || 
      field.toLowerCase().includes('country') || 
      field.toLowerCase().includes('market')
    );
    console.log('Geography-related fields:', geoFields);
    
  } catch (error) {
    console.error('Error analyzing Canadian products:', error);
  }
}

// Run the analysis
debugCanadianProducts();