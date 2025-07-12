/**
 * Debug Accord Product - Find and analyze the Accord Access product
 * Run this in browser console to see why it's not appearing in Step 2
 */

async function debugAccordProduct() {
  console.log('=== DEBUGGING ACCORD ACCESS PRODUCT ===');
  
  try {
    // Import the cache utility
    const { loadLenderProducts } = await import('./src/utils/lenderCache.js');
    const products = await loadLenderProducts();
    
    console.log(`\n📊 Total products in cache: ${products.length}`);
    
    // Find Accord products
    const accordProducts = products.filter(p => 
      p.name?.toLowerCase().includes('accord') ||
      p.lender_name?.toLowerCase().includes('accord') ||
      p.product_name?.toLowerCase().includes('accord')
    );
    
    console.log(`\n🎯 Accord products found: ${accordProducts.length}`);
    
    accordProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name || product.product_name}`);
      console.log(`   Lender: ${product.lender_name}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Country: ${product.country}`);
      console.log(`   Min Amount: ${product.min_amount}`);
      console.log(`   Max Amount: ${product.max_amount}`);
      console.log(`   Full product:`, product);
    });
    
    // Test filtering logic specifically for Accord
    if (accordProducts.length > 0) {
      console.log('\n🔍 TESTING FILTERING LOGIC FOR ACCORD:');
      
      const testForm = {
        headquarters: 'CA',
        fundingAmount: 100000,
        lookingFor: 'capital',
        accountsReceivableBalance: 0,
        fundsPurpose: 'working_capital'
      };
      
      const { filterProducts } = await import('./src/lib/recommendation.js');
      const filteredResults = filterProducts([accordProducts[0]], testForm);
      
      console.log(`\nAccord filtering test result: ${filteredResults.length} products`);
      if (filteredResults.length > 0) {
        console.log('✅ Accord product PASSES filtering');
      } else {
        console.log('❌ Accord product FAILS filtering');
        
        // Debug why it fails
        const product = accordProducts[0];
        const minAmount = product.min_amount ?? 0;
        const maxAmount = product.max_amount ?? Infinity;
        const geography = product.country;
        
        console.log('\nFailure analysis:');
        console.log(`  Geography match (CA): ${geography === 'CA'}`);
        console.log(`  Amount match ($100K): ${100000 >= minAmount && 100000 <= maxAmount} (range: ${minAmount}-${maxAmount})`);
        console.log(`  Category: ${product.category}`);
        console.log(`  Is capital product: ${!product.category?.toLowerCase().includes('equipment')}`);
      }
    }
    
  } catch (error) {
    console.error('Error analyzing Accord product:', error);
  }
}

// Run the analysis
debugAccordProduct();