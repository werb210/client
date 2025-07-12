/**
 * Direct AccordAccess Debug Test
 * Test the exact scenario that should find AccordAccess
 */

async function testAccordAccessDirect() {
  console.log('🧪 TESTING ACCORD ACCESS DIRECT SCENARIO');
  
  // Simulate the exact user request that should match Accord
  const testScenarios = [
    {
      name: 'Canadian $50K Capital (should match Accord max)',
      form: {
        headquarters: 'CA',
        fundingAmount: 50000,
        lookingFor: 'capital',
        accountsReceivableBalance: 0,
        fundsPurpose: 'working_capital'
      }
    },
    {
      name: 'Canadian $25K Capital (well within Accord range)',
      form: {
        headquarters: 'CA', 
        fundingAmount: 25000,
        lookingFor: 'capital',
        accountsReceivableBalance: 0,
        fundsPurpose: 'working_capital'
      }
    },
    {
      name: 'Canadian $100K Capital (exceeds Accord max)',
      form: {
        headquarters: 'CA',
        fundingAmount: 100000,
        lookingFor: 'capital',
        accountsReceivableBalance: 0,
        fundsPurpose: 'working_capital'
      }
    }
  ];
  
  try {
    // Get products from cache
    const products = JSON.parse(localStorage.getItem('lender-products-cache') || '[]');
    
    if (products.length === 0) {
      console.log('❌ No products in cache. Navigate to Step 2 first.');
      return;
    }
    
    console.log(`📦 Found ${products.length} products in cache`);
    
    // Find Accord products
    const accordProducts = products.filter(p => 
      p.name?.toLowerCase().includes('accord') ||
      p.lender_name?.toLowerCase().includes('accord') ||
      p.product_name?.toLowerCase().includes('accord')
    );
    
    console.log(`\n🎯 Accord products in cache: ${accordProducts.length}`);
    accordProducts.forEach(product => {
      console.log(`   ${product.name}: Category="${product.category}", Country="${product.country}", Range=$${product.min_amount}-$${product.max_amount}`);
    });
    
    // Import filtering logic
    const { filterProducts } = await import('/src/lib/recommendation.js');
    
    // Test each scenario
    for (const scenario of testScenarios) {
      console.log(`\n🧪 Testing: ${scenario.name}`);
      console.log(`   Form data:`, scenario.form);
      
      const filtered = filterProducts(products, scenario.form);
      console.log(`   Results: ${filtered.length} total products`);
      
      const accordInResults = filtered.filter(p => 
        p.name?.toLowerCase().includes('accord') ||
        p.lender_name?.toLowerCase().includes('accord') ||
        p.product_name?.toLowerCase().includes('accord')
      );
      
      console.log(`   Accord in results: ${accordInResults.length}`);
      
      if (accordInResults.length > 0) {
        console.log('   ✅ Accord product appears in filtered results');
        accordInResults.forEach(p => {
          console.log(`      ${p.name}: ${p.category}`);
        });
      } else {
        console.log('   ❌ Accord product NOT in results');
        
        // Test why Accord specifically fails
        if (accordProducts.length > 0) {
          const accord = accordProducts[0];
          const minAmount = accord.min_amount ?? 0;
          const maxAmount = accord.max_amount ?? Infinity;
          const requestAmount = scenario.form.fundingAmount;
          
          console.log(`   Debug: Accord max=${accord.max_amount}, request=${requestAmount}`);
          console.log(`   Amount check: ${requestAmount} <= ${maxAmount} = ${requestAmount <= maxAmount}`);
          console.log(`   Country check: ${accord.country} === ${scenario.form.headquarters} = ${accord.country === scenario.form.headquarters}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error in Accord test:', error);
  }
}

// Run the test
testAccordAccessDirect();