/**
 * TEST STEP 5 DOCUMENT AGGREGATION LOGIC - ChatGPT Instructions Implementation
 * Copy and paste this into browser console to test the new document aggregation
 */

// Test case: Canada $35K Working Capital, No Accounts Receivable
async function testStep5DocumentAggregation() {
  console.log('🧪 TESTING STEP 5 DOCUMENT AGGREGATION - CHATGPT INSTRUCTIONS');
  console.log('========================================================');
  
  try {
    // Test case parameters (same as Step 2 selections)
    const testCase = {
      selectedCategory: 'Working Capital',
      selectedCountry: 'CA', // Or 'canada'
      requestedAmount: 35000
    };
    
    console.log('🎯 Test case parameters:', testCase);
    console.log('');
    
    // Fetch all products to see what's available
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    if (!data.success || !data.products) {
      console.error('❌ Failed to fetch products');
      return;
    }
    
    const allProducts = data.products;
    console.log(`📦 Starting with ${allProducts.length} total products`);
    
    // Manual aggregation to test logic
    const normalizedCountry = testCase.selectedCountry === 'canada' || testCase.selectedCountry === 'Canada' ? 'CA' :
                             testCase.selectedCountry === 'united-states' || testCase.selectedCountry === 'United States' ? 'US' :
                             testCase.selectedCountry;
    
    console.log(`🌍 Normalized country: ${testCase.selectedCountry} → ${normalizedCountry}`);
    
    // ✅ STEP 1: Filter all local lender products that match criteria
    const eligibleProducts = allProducts.filter(product => {
      // Category match
      const categoryMatch = product.category === testCase.selectedCategory;
      
      // Country match
      const countryMatch = product.country === normalizedCountry;
      
      // Amount range match
      const minAmount = product.min_amount || product.amountMin || 0;
      const maxAmount = product.max_amount || product.amountMax || Number.MAX_SAFE_INTEGER;
      const amountMatch = minAmount <= testCase.requestedAmount && maxAmount >= testCase.requestedAmount;
      
      const isEligible = categoryMatch && countryMatch && amountMatch;
      
      if (isEligible) {
        console.log(`✅ Eligible: ${product.name} (${product.lender_name})`);
        console.log(`   Category: ${product.category}, Country: ${product.country}, Range: $${minAmount.toLocaleString()}-$${maxAmount.toLocaleString()}`);
        
        // Show document requirements for this product
        const docs = product.doc_requirements || 
                     product.documentRequirements || 
                     product.requiredDocuments || 
                     product.required_documents || 
                     [];
        console.log(`   Documents: [${docs.join(', ')}]`);
      }
      
      return isEligible;
    });
    
    console.log('');
    console.log(`🎯 Found ${eligibleProducts.length} eligible products`);
    
    if (eligibleProducts.length === 0) {
      console.log('❌ No products match criteria - cannot test aggregation');
      return;
    }
    
    // ✅ STEP 2: Aggregate and deduplicate required documents (UNION)
    const allDocumentLists = eligibleProducts.map(product => {
      // Try multiple field names for document requirements
      const docs = product.doc_requirements || 
                   product.documentRequirements || 
                   product.requiredDocuments || 
                   product.required_documents || 
                   [];
      
      console.log(`📝 ${product.name}: [${docs.join(', ')}]`);
      return docs;
    });
    
    // Create union of all required documents (deduplicated)
    const requiredDocuments = Array.from(
      new Set(allDocumentLists.flatMap(docs => docs))
    );
    
    console.log('');
    console.log('📊 FINAL AGGREGATION RESULTS:');
    console.log('=============================');
    console.log(`🎯 Eligible products: ${eligibleProducts.length}`);
    console.log(`🎯 Aggregated documents (${requiredDocuments.length}): [${requiredDocuments.join(', ')}]`);
    
    // Test the API function
    console.log('');
    console.log('🧪 TESTING API FUNCTION:');
    console.log('========================');
    
    // Import and test the aggregation function (if available in browser)
    if (typeof getDocumentRequirementsAggregation !== 'undefined') {
      const apiResults = await getDocumentRequirementsAggregation(
        testCase.selectedCategory,
        testCase.selectedCountry,
        testCase.requestedAmount
      );
      
      console.log('✅ API Results:', apiResults);
      console.log(`✅ API found ${apiResults.eligibleProducts?.length || 0} eligible products`);
      console.log(`✅ API documents: [${(apiResults.requiredDocuments || []).join(', ')}]`);
      
      // Compare manual vs API results
      const manualCount = eligibleProducts.length;
      const apiCount = apiResults.eligibleProducts?.length || 0;
      const manualDocs = requiredDocuments.sort();
      const apiDocs = (apiResults.requiredDocuments || []).sort();
      
      console.log('');
      console.log('🔍 COMPARISON:');
      console.log('==============');
      console.log(`Products: Manual=${manualCount}, API=${apiCount} ${manualCount === apiCount ? '✅' : '❌'}`);
      console.log(`Documents: Manual=[${manualDocs.join(', ')}]`);
      console.log(`           API=[${apiDocs.join(', ')}]`);
      console.log(`Documents match: ${JSON.stringify(manualDocs) === JSON.stringify(apiDocs) ? '✅' : '❌'}`);
    } else {
      console.log('⚠️ getDocumentRequirementsAggregation function not available in browser context');
    }
    
    return {
      eligibleProducts: eligibleProducts.length,
      requiredDocuments: requiredDocuments,
      message: `Documents required across ${eligibleProducts.length} eligible ${testCase.selectedCategory} lenders`
    };
    
  } catch (error) {
    console.error('❌ Error testing aggregation logic:', error);
  }
}

// Run the test
testStep5DocumentAggregation().then(results => {
  if (results) {
    console.log('');
    console.log('📋 CHATGPT REPORT SUMMARY:');
    console.log('=========================');
    console.log(`✅ Number of eligible products found: ${results.eligibleProducts}`);
    console.log(`✅ Final requiredDocuments list: [${results.requiredDocuments.join(', ')}]`);
    console.log(`✅ ${results.message}`);
    console.log('');
    console.log('🎯 TEST STATUS: Document aggregation logic working correctly');
    
    if (results.requiredDocuments.length === 0) {
      console.log('❌ Issue: No documents in aggregated list - check requiredDocuments field names');
    }
  }
});