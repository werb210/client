/**
 * Test AccordAccess Working Capital Document Requirements
 * Check what documents are required for the specific AccordAccess product
 */

async function testAccordAccessDocuments() {
  console.log('🧪 Testing AccordAccess Specific Document Requirements');
  console.log('=' * 70);

  try {
    // Fetch all lender products
    const response = await fetch('http://localhost:5000/api/public/lenders');
    const data = await response.json();
    
    if (!data.success || !data.products) {
      throw new Error('Failed to fetch lender products');
    }

    const allLenders = data.products;
    console.log(`🌐 Fetched ${allLenders.length} total lender products`);

    // Find AccordAccess specifically
    const accordProducts = allLenders.filter(product => 
      product.lenderName?.toLowerCase().includes('accord') || 
      product.name?.toLowerCase().includes('accordaccess')
    );

    console.log(`\n🎯 Found ${accordProducts.length} Accord products:`);
    accordProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.lenderName}: ${product.name}`);
      console.log(`      Category: ${product.category}`);
      console.log(`      Country: ${product.country}`);
      console.log(`      Amount: $${product.amountMin?.toLocaleString()} - $${product.amountMax?.toLocaleString()}`);
      console.log(`      Required Documents: [${product.requiredDocuments?.join(', ') || 'None specified'}]`);
      console.log(`      Interest Rate: ${product.interestRate || 'N/A'}`);
      console.log(`      Credit Score: ${product.creditScore || 'N/A'}`);
      console.log('');
    });

    // Test with US Business Line of Credit scenario
    console.log('\n🇺🇸 Testing US Business Line of Credit $100K scenario:');
    const usTestParams = {
      selectedProductType: 'Business Line of Credit',
      businessLocation: 'united-states',
      fundingAmount: 100000
    };

    const usEligibleLenders = allLenders.filter(product => {
      const categoryMatch = product.category?.toLowerCase() === usTestParams.selectedProductType.toLowerCase();
      const countryMatch = product.country === 'US';
      const amountMatch = product.amountMin <= usTestParams.fundingAmount && product.amountMax >= usTestParams.fundingAmount;
      
      return categoryMatch && countryMatch && amountMatch;
    });

    console.log(`   ✅ Found ${usEligibleLenders.length} eligible US lenders:`);
    usEligibleLenders.forEach((lender, index) => {
      console.log(`      ${index + 1}. ${lender.lenderName}: ${lender.name}`);
      console.log(`         Documents: [${lender.requiredDocuments?.join(', ') || 'None'}]`);
    });

    // Calculate intersection for US scenario
    if (usEligibleLenders.length > 1) {
      const usAllRequiredDocs = usEligibleLenders.map(product => product.requiredDocuments || []);
      let usRequiredDocuments = usAllRequiredDocs[0] || [];
      for (let i = 1; i < usAllRequiredDocs.length; i++) {
        usRequiredDocuments = usRequiredDocuments.filter(doc => 
          usAllRequiredDocs[i].includes(doc)
        );
      }

      console.log(`\n   🎯 US Document Intersection: ${usRequiredDocuments.length} documents`);
      if (usRequiredDocuments.length > 0) {
        usRequiredDocuments.forEach((doc, index) => {
          console.log(`      ${index + 1}. ${doc}`);
        });
      } else {
        console.log('      ❌ No common documents required by ALL US lenders');
      }
    }

    // Test edge case scenarios
    console.log('\n🔍 Edge Case Testing:');
    
    // Very high amount
    const highAmountLenders = allLenders.filter(product => 
      product.amountMax >= 1000000
    );
    console.log(`   📈 Lenders supporting $1M+: ${highAmountLenders.length}`);

    // Very low amount
    const lowAmountLenders = allLenders.filter(product => 
      product.amountMin <= 5000
    );
    console.log(`   📉 Lenders supporting $5K or less: ${lowAmountLenders.length}`);

    // Equipment financing specific
    const equipmentLenders = allLenders.filter(product => 
      product.category?.toLowerCase().includes('equipment')
    );
    console.log(`   🔧 Equipment financing lenders: ${equipmentLenders.length}`);

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }

  console.log('\n' + '=' * 70);
  console.log('🏁 AccordAccess Document Requirements Test Complete');
}

// Run the test
testAccordAccessDocuments().catch(console.error);