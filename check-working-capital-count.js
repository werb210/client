/**
 * Check Working Capital products count for Canada $40,000
 */

async function checkWorkingCapitalCount() {
  try {
    console.log("🔍 CHECKING WORKING CAPITAL PRODUCTS FOR CANADA $40,000");
    
    // Fetch from the working lenders endpoint
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    if (!data.success || !data.products) {
      console.log("❌ No products data found");
      return 0;
    }
    
    const products = data.products;
    console.log(`📊 Total products in database: ${products.length}`);
    
    // Filter for Working Capital products matching criteria
    const matching = products.filter(product => {
      // Check category for working capital
      const category = (product.category || '').toLowerCase();
      const isWorkingCapital = category.includes('working capital');
      
      // Check country for Canada
      const country = product.country || '';
      const isCanada = country === 'CA' || country.toLowerCase() === 'canada';
      
      // Check amount range for $40,000
      const minAmount = product.amountMin || product.min_amount || 0;
      const maxAmount = product.amountMax || product.max_amount || 999999999;
      const inRange = minAmount <= 40000 && maxAmount >= 40000;
      
      if (isWorkingCapital && isCanada && inRange) {
        console.log(`✅ MATCH: ${product.name} (${product.lender_name})`);
        console.log(`   Range: $${minAmount.toLocaleString()} - $${maxAmount.toLocaleString()}`);
      }
      
      return isWorkingCapital && isCanada && inRange;
    });
    
    console.log(`\n🎯 RESULT: ${matching.length} Working Capital products match Canada $40,000`);
    return matching.length;
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return 0;
  }
}

// Execute and return result
checkWorkingCapitalCount().then(count => {
  console.log(`\n📋 FINAL ANSWER: ${count} Working Capital products available`);
  window.workingCapitalCount = count;
}).catch(error => {
  console.error("Check failed:", error);
});