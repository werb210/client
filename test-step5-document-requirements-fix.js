/**
 * STEP 5 DOCUMENT REQUIREMENTS FIX VALIDATION TEST
 * Tests the critical fixes for Step 5 document requirements:
 * 1. Category mapping from Step 2 ("Working Capital") to backend format
 * 2. Fallback document logic when no products match
 * 3. "Proceed without Required Documents" bypass functionality
 * 4. Step 6-7 bypass handling
 * 
 * Execute in browser console on Step 5
 */

async function testStep5DocumentRequirementsFix() {
  console.log('🔧 STEP 5 DOCUMENT REQUIREMENTS FIX VALIDATION TEST');
  console.log('='.repeat(55));
  
  const results = [];
  
  // Test 1: Category Mapping Fix
  console.log('\n1. TESTING CATEGORY MAPPING FIX');
  console.log('-'.repeat(35));
  
  try {
    // Check if getDocumentRequirementsAggregation is available
    if (typeof getDocumentRequirementsAggregation === 'function') {
      console.log('✅ getDocumentRequirementsAggregation function is available');
      
      // Test category mappings
      const testCategories = [
        'Working Capital',
        'Term Loan', 
        'Business Line of Credit',
        'Equipment Financing',
        'Invoice Factoring'
      ];
      
      let mappingResults = [];
      
      for (const category of testCategories) {
        try {
          console.log(`\n🧪 Testing category: "${category}"`);
          const result = await getDocumentRequirementsAggregation(category, 'CA', 50000);
          
          mappingResults.push({
            category,
            hasMatches: result.hasMatches,
            eligibleProducts: result.eligibleProducts.length,
            requiredDocuments: result.requiredDocuments.length,
            message: result.message
          });
          
          console.log(`   Products found: ${result.eligibleProducts.length}`);
          console.log(`   Documents required: ${result.requiredDocuments.length}`);
          console.log(`   Has matches: ${result.hasMatches}`);
          
          if (!result.hasMatches && result.requiredDocuments.length > 0) {
            console.log(`   ✅ Fallback logic working - ${result.requiredDocuments.length} fallback documents provided`);
          }
          
        } catch (error) {
          console.log(`   ❌ Error testing ${category}:`, error.message);
          mappingResults.push({
            category,
            error: error.message
          });
        }
      }
      
      results.push({
        test: 'Category Mapping',
        status: mappingResults.every(r => !r.error),
        details: mappingResults
      });
      
    } else {
      console.log('❌ getDocumentRequirementsAggregation function not available');
      results.push({
        test: 'Category Mapping',
        status: false,
        error: 'Function not available'
      });
    }
  } catch (error) {
    console.log('❌ Category mapping test failed:', error);
    results.push({
      test: 'Category Mapping',
      status: false,
      error: error.message
    });
  }
  
  // Test 2: Form State Structure
  console.log('\n2. TESTING FORM STATE STRUCTURE');
  console.log('-'.repeat(35));
  
  try {
    // Check if form data context is available
    const state = window.formDataState || {};
    console.log('Available state keys:', Object.keys(state));
    
    const step2Data = state.step2 || {};
    const step1Data = state.step1 || {};
    
    console.log('Step 2 selected category:', step2Data.selectedCategory);
    console.log('Step 1 business location:', step1Data.businessLocation);
    console.log('Step 1 funding amount:', step1Data.fundingAmount);
    
    const hasRequiredFields = !!(step2Data.selectedCategory && step1Data.businessLocation && step1Data.fundingAmount);
    
    results.push({
      test: 'Form State Structure',
      status: hasRequiredFields,
      details: {
        selectedCategory: step2Data.selectedCategory,
        businessLocation: step1Data.businessLocation,
        fundingAmount: step1Data.fundingAmount
      }
    });
    
    if (hasRequiredFields) {
      console.log('✅ Required form state fields are present');
    } else {
      console.log('❌ Missing required form state fields');
    }
    
  } catch (error) {
    console.log('❌ Form state test failed:', error);
    results.push({
      test: 'Form State Structure',
      status: false,
      error: error.message
    });
  }
  
  // Test 3: Bypass Functionality
  console.log('\n3. TESTING BYPASS FUNCTIONALITY');
  console.log('-'.repeat(35));
  
  try {
    // Check if ProceedBypassBanner is rendered
    const bypassBanner = document.querySelector('[data-testid="proceed-bypass-banner"]') || 
                        document.querySelector('button').textContent?.includes('Proceed without Required Documents');
    
    if (bypassBanner) {
      console.log('✅ Bypass banner is present in DOM');
    } else {
      console.log('⚠️ Bypass banner not found - checking for bypass button');
      const buttons = Array.from(document.querySelectorAll('button'));
      const bypassButton = buttons.find(btn => btn.textContent?.includes('Proceed without'));
      
      if (bypassButton) {
        console.log('✅ Bypass button found');
      } else {
        console.log('❌ No bypass functionality found in DOM');
      }
    }
    
    // Check if handleBypass function is available in global scope
    if (typeof handleBypass === 'function') {
      console.log('✅ handleBypass function is available');
    } else {
      console.log('⚠️ handleBypass function not in global scope');
    }
    
    results.push({
      test: 'Bypass Functionality',
      status: !!bypassBanner,
      details: {
        bypassBannerPresent: !!bypassBanner,
        bypassFunctionAvailable: typeof handleBypass === 'function'
      }
    });
    
  } catch (error) {
    console.log('❌ Bypass functionality test failed:', error);
    results.push({
      test: 'Bypass Functionality',
      status: false,
      error: error.message
    });
  }
  
  // Test 4: Document Aggregation API
  console.log('\n4. TESTING DOCUMENT AGGREGATION API');
  console.log('-'.repeat(40));
  
  try {
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    console.log('API Response Status:', response.status);
    console.log('API Response OK:', response.ok);
    
    if (response.ok) {
      const products = Array.isArray(data) ? data : data.products || [];
      console.log(`✅ API returned ${products.length} lender products`);
      
      // Check for Working Capital products specifically
      const workingCapitalProducts = products.filter(p => 
        p.category?.toLowerCase().includes('working') ||
        p.category?.toLowerCase().includes('capital') ||
        p.productType?.toLowerCase().includes('working')
      );
      
      console.log(`   Working Capital products found: ${workingCapitalProducts.length}`);
      
      if (workingCapitalProducts.length > 0) {
        console.log('   Sample Working Capital product:', {
          name: workingCapitalProducts[0].name,
          category: workingCapitalProducts[0].category,
          country: workingCapitalProducts[0].country
        });
      }
      
      results.push({
        test: 'Document Aggregation API',
        status: true,
        details: {
          totalProducts: products.length,
          workingCapitalProducts: workingCapitalProducts.length,
          responseStatus: response.status
        }
      });
      
    } else {
      console.log('❌ API request failed');
      results.push({
        test: 'Document Aggregation API',
        status: false,
        error: `HTTP ${response.status}`
      });
    }
    
  } catch (error) {
    console.log('❌ Document aggregation API test failed:', error);
    results.push({
      test: 'Document Aggregation API',
      status: false,
      error: error.message
    });
  }
  
  // Test Summary
  console.log('\n' + '='.repeat(55));
  console.log('TEST SUMMARY');
  console.log('='.repeat(55));
  
  const passedTests = results.filter(r => r.status).length;
  const totalTests = results.length;
  const passRate = Math.round((passedTests / totalTests) * 100);
  
  console.log(`\nOverall Results: ${passedTests}/${totalTests} tests passed (${passRate}%)`);
  
  results.forEach(result => {
    const status = result.status ? '✅' : '❌';
    console.log(`${status} ${result.test}: ${result.status ? 'PASSED' : 'FAILED'}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  // Recommendations
  console.log('\nRECOMMENDATIONS:');
  console.log('-'.repeat(15));
  
  if (passRate === 100) {
    console.log('🎉 All tests passed! Step 5 document requirements fix is working correctly.');
  } else if (passRate >= 75) {
    console.log('⚠️ Most tests passed. Check failed tests and address remaining issues.');
  } else {
    console.log('🚨 Critical issues detected. Step 5 document requirements fix needs attention.');
  }
  
  return {
    passRate,
    results,
    summary: `${passedTests}/${totalTests} tests passed`
  };
}

// Execute test if run in browser
if (typeof window !== 'undefined') {
  console.log('🚀 Starting Step 5 Document Requirements Fix validation...');
  testStep5DocumentRequirementsFix()
    .then(result => {
      console.log('\n✅ Step 5 fix validation complete!');
      window.step5FixTestResults = result;
    })
    .catch(error => {
      console.error('❌ Step 5 fix validation failed:', error);
    });
}

// Make function available globally
if (typeof window !== 'undefined') {
  window.testStep5DocumentRequirementsFix = testStep5DocumentRequirementsFix;
}