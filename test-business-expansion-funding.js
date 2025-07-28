/**
 * Test Business Expansion Funding Options
 * Check what lender products are available when user selects "Business Expansion" purpose
 */

async function testBusinessExpansionFunding() {
  console.log('🔍 Testing Business Expansion Funding Options...\n');
  
  // Test different business expansion scenarios
  const testScenarios = [
    {
      name: 'US Business Expansion - $100K',
      formData: {
        headquarters: 'US',
        fundingAmount: 100000,
        lookingFor: 'capital',
        accountsReceivableBalance: 50000,
        fundsPurpose: 'expansion',
        averageMonthlyRevenue: 25000
      }
    },
    {
      name: 'Canadian Business Expansion - $250K',
      formData: {
        headquarters: 'CA', 
        fundingAmount: 250000,
        lookingFor: 'capital',
        accountsReceivableBalance: 0,
        fundsPurpose: 'expansion',
        averageMonthlyRevenue: 40000
      }
    },
    {
      name: 'US Business Expansion - Equipment & Capital - $500K',
      formData: {
        headquarters: 'US',
        fundingAmount: 500000,
        lookingFor: 'both',
        accountsReceivableBalance: 100000,
        fundsPurpose: 'expansion',
        averageMonthlyRevenue: 75000
      }
    }
  ];

  for (const scenario of testScenarios) {
    console.log(`\n📊 ${scenario.name}`);
    console.log(`   Purpose: ${scenario.formData.fundsPurpose}`);
    console.log(`   Amount: $${scenario.formData.fundingAmount.toLocaleString()}`);
    console.log(`   Location: ${scenario.formData.headquarters}`);
    console.log(`   Looking For: ${scenario.formData.lookingFor}`);
    console.log(`   AR Balance: $${scenario.formData.accountsReceivableBalance.toLocaleString()}`);
    console.log(`   Monthly Revenue: $${scenario.formData.averageMonthlyRevenue.toLocaleString()}`);
    
    try {
      // Test API endpoint that would filter products
      const response = await fetch('/api/public/lenders');
      const data = await response.json();
      
      if (data.success && data.products) {
        console.log(`   📈 Total Available Products: ${data.products.length}`);
        
        // Apply the same filtering logic as the recommendation engine
        const filteredProducts = data.products.filter(product => {
          const minAmount = parseFloat(product.amountMin) || 0;
          const maxAmount = parseFloat(product.amountMax) || 0;
          
          return (
            // Geography match
            product.geography.includes(scenario.formData.headquarters) &&
            // Amount range
            scenario.formData.fundingAmount >= minAmount && 
            scenario.formData.fundingAmount <= maxAmount &&
            // Product type match
            (scenario.formData.lookingFor === "both" ||
             (scenario.formData.lookingFor === "capital" && product.category !== "equipment_financing") ||
             (scenario.formData.lookingFor === "equipment" && product.category === "equipment_financing"))
          );
        });
        
        console.log(`   ✅ Matching Products: ${filteredProducts.length}`);
        
        if (filteredProducts.length > 0) {
          console.log(`   💰 Product Categories Available:`);
          const categories = [...new Set(filteredProducts.map(p => p.category))];
          categories.forEach(cat => {
            const count = filteredProducts.filter(p => p.category === cat).length;
            console.log(`      - ${cat}: ${count} products`);
          });
          
          console.log(`   🏦 Lenders Available:`);
          const lenders = [...new Set(filteredProducts.map(p => p.lenderName))];
          lenders.slice(0, 5).forEach(lender => {
            console.log(`      - ${lender}`);
          });
          if (lenders.length > 5) {
            console.log(`      ... and ${lenders.length - 5} more`);
          }
        } else {
          console.log(`   ❌ No matching products found for this scenario`);
        }
        
      } else {
        console.log(`   ❌ API Error: ${data.message || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Network Error: ${error.message}`);
    }
  }
  
  console.log('\n📋 Business Expansion Funding Summary:');
  console.log('When users select "Business Expansion" as their purpose:');
  console.log('• All product categories are available (no special restrictions)');
  console.log('• Filtering is based on: geography, amount range, and product type preference');
  console.log('• No special bonus scoring like inventory → PO financing');
  console.log('• Available categories typically include:');
  console.log('  - Term Loans (most common for expansion)');
  console.log('  - Lines of Credit (flexible funding)');
  console.log('  - SBA Loans (US only, government-backed)');
  console.log('  - Working Capital loans');
  console.log('  - Asset-based lending (if collateral available)');
  console.log('\n💡 Recommendation: Business expansion is a broad category that qualifies for most funding types');
}

// Run the test
testBusinessExpansionFunding().catch(console.error);