/**
 * Check Working Capital products for Canada $40,000
 */

console.log("🔍 CHECKING WORKING CAPITAL PRODUCTS FOR CANADA $40,000");

async function checkWorkingCapitalProducts() {
  try {
    // Fetch lender products from the API
    const response = await fetch('/api/public/lender-products');
    const data = await response.json();
    
    if (!data.success || !data.products) {
      console.error("❌ Failed to fetch lender products:", data);
      return;
    }
    
    const products = data.products;
    console.log(`📊 Total products in database: ${products.length}`);
    
    // Filter for Working Capital products
    const workingCapitalProducts = products.filter(product => {
      // Check category matching
      const category = product.category?.toLowerCase() || '';
      const productName = product.productName?.toLowerCase() || '';
      const lenderName = product.lenderName?.toLowerCase() || '';
      
      return category.includes('working capital') || 
             productName.includes('working capital') ||
             category.includes('working-capital');
    });
    
    console.log(`💼 Working Capital products found: ${workingCapitalProducts.length}`);
    
    // Filter for Canada availability
    const canadaProducts = workingCapitalProducts.filter(product => {
      const countries = product.countries || product.geography || [];
      const countryList = Array.isArray(countries) ? countries : [countries];
      
      return countryList.some(country => {
        const c = country?.toLowerCase() || '';
        return c === 'ca' || c === 'canada' || c.includes('canada');
      });
    });
    
    console.log(`🇨🇦 Canada Working Capital products: ${canadaProducts.length}`);
    
    // Filter for $40,000 amount range
    const amountFilteredProducts = canadaProducts.filter(product => {
      // Check various amount field names
      const minAmount = product.amount_min || product.amountMin || product.min_amount || product.minAmount || 0;
      const maxAmount = product.amount_max || product.amountMax || product.max_amount || product.maxAmount || Number.MAX_SAFE_INTEGER;
      
      const requestedAmount = 40000;
      
      return requestedAmount >= minAmount && requestedAmount <= maxAmount;
    });
    
    console.log(`💰 Products matching $40,000 range: ${amountFilteredProducts.length}`);
    
    // Display details of matching products
    console.log("\n📋 MATCHING PRODUCTS:");
    amountFilteredProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.lenderName || 'Unknown Lender'}`);
      console.log(`   Product: ${product.productName || 'Unknown Product'}`);
      console.log(`   Category: ${product.category || 'Unknown Category'}`);
      console.log(`   Amount Range: $${product.amount_min || product.amountMin || 0} - $${product.amount_max || product.amountMax || 'Unlimited'}`);
      console.log(`   Countries: ${JSON.stringify(product.countries || product.geography || [])}`);
      console.log("");
    });
    
    return {
      total: products.length,
      workingCapital: workingCapitalProducts.length,
      canada: canadaProducts.length,
      matching: amountFilteredProducts.length,
      products: amountFilteredProducts
    };
    
  } catch (error) {
    console.error("❌ Error checking products:", error);
    return null;
  }
}

// Execute immediately
checkWorkingCapitalProducts().then(result => {
  if (result) {
    console.log(`\n✅ SUMMARY: ${result.matching} Working Capital products available in Canada for $40,000`);
    window.workingCapitalResults = result;
  }
}).catch(error => {
  console.error("💥 Check failed:", error);
});