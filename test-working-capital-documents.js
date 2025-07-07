/**
 * Test Working Capital Document Requirements
 * Tests what documents are required when user selects working capital
 */

async function testWorkingCapitalDocuments() {
  console.log('🧪 Testing Working Capital Document Requirements with Intersection Logic');
  console.log('=' * 70);

  try {
    // Test Parameters: Canadian Working Capital $40,000 (matching your specification)
    const testParams = {
      selectedProductType: 'Working Capital',
      businessLocation: 'canada',
      fundingAmount: 40000
    };

    console.log('📋 Test Parameters:');
    console.log(`   Product Type: ${testParams.selectedProductType}`);
    console.log(`   Location: ${testParams.businessLocation}`);
    console.log(`   Amount: $${testParams.fundingAmount.toLocaleString()}`);

    // Call our new intersection logic
    const response = await fetch('http://localhost:5000/api/public/lenders');
    const data = await response.json();
    
    if (!data.success || !data.products) {
      throw new Error('Failed to fetch lender products');
    }

    const allLenders = data.products;
    console.log(`\n🌐 Fetched ${allLenders.length} total lender products`);

    // Apply filtering logic (same as in documentIntersection.ts)
    const countryCode = testParams.businessLocation === 'canada' ? 'CA' : 'US';
    
    const eligibleLenders = allLenders.filter(product => {
      const categoryMatch = product.category?.toLowerCase() === testParams.selectedProductType.toLowerCase();
      const countryMatch = product.country === countryCode;
      const amountMatch = product.amountMin <= testParams.fundingAmount && product.amountMax >= testParams.fundingAmount;
      
      return categoryMatch && countryMatch && amountMatch;
    });

    console.log(`\n✅ Found ${eligibleLenders.length} eligible lenders:`);
    eligibleLenders.forEach((lender, index) => {
      console.log(`   ${index + 1}. ${lender.lenderName}: ${lender.name}`);
      console.log(`      Amount: $${lender.amountMin?.toLocaleString()} - $${lender.amountMax?.toLocaleString()}`);
      console.log(`      Documents: [${lender.requiredDocuments?.join(', ') || 'None specified'}]`);
    });

    if (eligibleLenders.length === 0) {
      console.log('\n❌ No matching lenders found for criteria');
      return;
    }

    // Calculate document intersection
    const allRequiredDocs = eligibleLenders.map(product => product.requiredDocuments || []);
    console.log('\n📄 Document lists from each lender:');
    allRequiredDocs.forEach((docs, index) => {
      console.log(`   ${eligibleLenders[index].lenderName}: [${docs.join(', ')}]`);
    });

    // Compute intersection
    let requiredDocuments = allRequiredDocs[0] || [];
    for (let i = 1; i < allRequiredDocs.length; i++) {
      requiredDocuments = requiredDocuments.filter(doc => 
        allRequiredDocs[i].includes(doc)
      );
    }

    console.log('\n🎯 FINAL DOCUMENT INTERSECTION:');
    if (requiredDocuments.length > 0) {
      console.log(`   ✅ ${requiredDocuments.length} documents required by ALL matching lenders:`);
      requiredDocuments.forEach((doc, index) => {
        console.log(`   ${index + 1}. ${doc}`);
      });
    } else {
      console.log('   ❌ No documents are required by ALL matching lenders');
      console.log('   📝 Users would need to review individual lender requirements');
    }

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Matching Lenders: ${eligibleLenders.length}`);
    console.log(`   Document Intersection: ${requiredDocuments.length} documents`);
    console.log(`   Result: ${requiredDocuments.length > 0 ? 'SUCCESS - Common documents found' : 'INFO - No common documents'}`);

  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }

  console.log('\n' + '=' * 70);
  console.log('🏁 Working Capital Document Requirements Test Complete');
}

// Run the test
testWorkingCapitalDocuments().catch(console.error);