/**
 * DEBUG: Canadian Line of Credit and Working Capital Products
 * Purpose: Check actual product data to understand maximum amounts and categories
 */

console.log('🔍 DEBUGGING CANADIAN LOC & WORKING CAPITAL PRODUCTS');
console.log('=====================================================');

async function fetchAndAnalyzeProducts() {
  try {
    const response = await fetch('http://localhost:5000/api/public/lender-products');
    const products = await response.json();
    
    console.log(`\n📊 Total Products in Database: ${products.length}`);
    
    // Filter Canadian products
    const canadianProducts = products.filter(p => p.country === 'CA');
    console.log(`📊 Canadian Products: ${canadianProducts.length}`);
    
    // Analyze Line of Credit products
    const locProducts = canadianProducts.filter(p => 
      p.category?.toLowerCase().includes('line of credit') || 
      p.category?.toLowerCase().includes('loc')
    );
    
    console.log(`\n🔗 CANADIAN LINE OF CREDIT PRODUCTS: ${locProducts.length}`);
    console.log('=' .repeat(50));
    
    if (locProducts.length > 0) {
      locProducts.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name} (${product.lender_name || 'Unknown'})`);
        console.log(`   Category: ${product.category}`);
        console.log(`   Amount Range: $${product.amount_min?.toLocaleString()} - $${product.amount_max?.toLocaleString()}`);
        console.log(`   Maximum Amount: $${product.amount_max?.toLocaleString()}`);
      });
      
      // Find highest LOC maximum
      const maxLOCAmount = Math.max(...locProducts.map(p => p.amount_max || 0));
      console.log(`\n🎯 HIGHEST LOC MAXIMUM IN CANADA: $${maxLOCAmount.toLocaleString()}`);
    } else {
      console.log('❌ No Line of Credit products found for Canada');
    }
    
    // Analyze Working Capital products
    const workingCapitalProducts = canadianProducts.filter(p => 
      p.category?.toLowerCase().includes('working capital') ||
      p.category?.toLowerCase().includes('working_capital')
    );
    
    console.log(`\n💼 CANADIAN WORKING CAPITAL PRODUCTS: ${workingCapitalProducts.length}`);
    console.log('=' .repeat(50));
    
    if (workingCapitalProducts.length > 0) {
      workingCapitalProducts.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name} (${product.lender_name || 'Unknown'})`);
        console.log(`   Category: ${product.category}`);
        console.log(`   Amount Range: $${product.amount_min?.toLocaleString()} - $${product.amount_max?.toLocaleString()}`);
      });
    } else {
      console.log('❌ No Working Capital products found for Canada');
      
      // Check for similar categories
      const similarCategories = [...new Set(canadianProducts.map(p => p.category))].filter(cat => 
        cat?.toLowerCase().includes('capital') || 
        cat?.toLowerCase().includes('loan') ||
        cat?.toLowerCase().includes('term')
      );
      
      console.log('\n🔍 Similar categories found:');
      similarCategories.forEach(cat => console.log(`   - ${cat}`));
    }
    
    // Check all Canadian categories
    const allCategories = [...new Set(canadianProducts.map(p => p.category))];
    console.log(`\n📋 ALL CANADIAN PRODUCT CATEGORIES: ${allCategories.length}`);
    allCategories.forEach(cat => {
      const count = canadianProducts.filter(p => p.category === cat).length;
      console.log(`   • ${cat}: ${count} products`);
    });
    
    console.log('\n🎯 SUMMARY FOR $600K-$800K REQUESTS:');
    console.log('=' .repeat(40));
    
    // Products that fit $600K-800K range
    const fitsRange = canadianProducts.filter(p => 
      (p.amount_min || 0) <= 600000 && (p.amount_max || Infinity) >= 800000
    );
    
    console.log(`Products fitting $600K-$800K range: ${fitsRange.length}`);
    fitsRange.forEach(p => {
      console.log(`   ✅ ${p.name} (${p.category}) - $${p.amount_min?.toLocaleString()}-$${p.amount_max?.toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
  }
}

// Run the analysis
fetchAndAnalyzeProducts();