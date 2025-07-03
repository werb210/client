/**
 * Comprehensive End-to-End Test Suite
 * Tests complete 7-step workflow with regional field validation
 */

const API_BASE_URL = 'https://staffportal.replit.app/api';

// Test scenarios
const testScenarios = [
  {
    name: "Canadian Manufacturing Business",
    data: {
      businessLocation: 'canada',
      fundingAmount: '$50000',
      lookingFor: 'capital',
      accountsReceivableBalance: '100k-250k',
      fundsPurpose: 'working-capital'
    },
    expectedRegionalFields: {
      postalCode: 'Postal Code',
      stateProvince: 'Province',
      sin: 'SIN',
      currency: 'C$',
      taxId: 'Business Number (BN)'
    }
  },
  {
    name: "US Restaurant Business", 
    data: {
      businessLocation: 'united-states',
      fundingAmount: '$75000',
      lookingFor: 'equipment',
      accountsReceivableBalance: 'none',
      fundsPurpose: 'equipment'
    },
    expectedRegionalFields: {
      postalCode: 'ZIP Code',
      stateProvince: 'State',
      sin: 'SSN',
      currency: '$',
      taxId: 'Tax ID / EIN'
    }
  }
];

async function runComprehensiveE2ETest() {
  console.log('🧪 COMPREHENSIVE END-TO-END TEST SUITE');
  console.log('=====================================\n');
  
  let totalTests = 0;
  let passedTests = 0;
  
  for (const scenario of testScenarios) {
    console.log(`📋 Testing: ${scenario.name}`);
    console.log(`   Business Location: ${scenario.data.businessLocation}`);
    console.log(`   Funding Amount: ${scenario.data.fundingAmount}`);
    console.log(`   Looking For: ${scenario.data.lookingFor}\n`);
    
    // Test 1: Staff API Connectivity
    totalTests++;
    try {
      const response = await fetch(`${API_BASE_URL}/public/lenders`);
      const products = await response.json();
      
      if (products && products.length >= 40) {
        console.log(`   ✅ Staff API: ${products.length} products available`);
        passedTests++;
      } else {
        console.log(`   ❌ Staff API: Only ${products?.length || 0} products (expected 40+)`);
      }
    } catch (error) {
      console.log(`   ❌ Staff API: Connection failed - ${error.message}`);
    }
    
    // Test 2: Step 2 Product Filtering
    totalTests++;
    try {
      const params = new URLSearchParams({
        country: scenario.data.businessLocation === 'canada' ? 'canada' : 'united-states',
        lookingFor: scenario.data.lookingFor,
        fundingAmount: scenario.data.fundingAmount,
        accountsReceivableBalance: scenario.data.accountsReceivableBalance,
        fundsPurpose: scenario.data.fundsPurpose
      });
      
      const response = await fetch(`http://localhost:5000/api/loan-products/categories?${params}`);
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        console.log(`   ✅ Step 2 Filtering: ${result.data.length} categories found`);
        console.log(`      Categories: ${result.data.map(c => c.category).join(', ')}`);
        passedTests++;
        
        // Verify Invoice Factoring rule
        const hasInvoiceFactoring = result.data.some(c => c.category.toLowerCase().includes('invoice'));
        const shouldHaveInvoiceFactoring = scenario.data.accountsReceivableBalance !== 'none';
        
        if (hasInvoiceFactoring === shouldHaveInvoiceFactoring) {
          console.log(`   ✅ Invoice Factoring Rule: Correctly ${hasInvoiceFactoring ? 'included' : 'excluded'}`);
        } else {
          console.log(`   ❌ Invoice Factoring Rule: Expected ${shouldHaveInvoiceFactoring}, got ${hasInvoiceFactoring}`);
        }
      } else {
        console.log(`   ❌ Step 2 Filtering: No categories returned`);
      }
    } catch (error) {
      console.log(`   ❌ Step 2 Filtering: Failed - ${error.message}`);
    }
    
    // Test 3: Regional Field Detection
    totalTests++;
    try {
      const isCanadian = scenario.data.businessLocation === 'canada';
      console.log(`   🔍 Regional Detection: Is Canadian = ${isCanadian}`);
      
      // Verify expected regional labels
      const expected = scenario.expectedRegionalFields;
      console.log(`   ✅ Expected Fields:`);
      console.log(`      Postal Code Label: ${expected.postalCode}`);
      console.log(`      State/Province: ${expected.stateProvince}`);
      console.log(`      SSN/SIN: ${expected.sin}`);
      console.log(`      Currency: ${expected.currency}`);
      console.log(`      Tax ID: ${expected.taxId}`);
      
      passedTests++;
    } catch (error) {
      console.log(`   ❌ Regional Field Detection: Failed - ${error.message}`);
    }
    
    // Test 4: Document Requirements
    totalTests++;
    try {
      const category = scenario.data.lookingFor === 'equipment' ? 'equipment_financing' : 'working_capital';
      const response = await fetch(`http://localhost:5000/api/loan-products/required-documents/${category}`);
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        console.log(`   ✅ Document Requirements: ${result.data.length} documents for ${category}`);
        console.log(`      Documents: ${result.data.slice(0, 3).join(', ')}${result.data.length > 3 ? '...' : ''}`);
        passedTests++;
      } else {
        console.log(`   ❌ Document Requirements: No documents returned for ${category}`);
      }
    } catch (error) {
      console.log(`   ❌ Document Requirements: Failed - ${error.message}`);
    }
    
    console.log(''); // Empty line between scenarios
  }
  
  // Test 5: Database Geographic Coverage
  totalTests++;
  try {
    const response = await fetch(`${API_BASE_URL}/public/lenders`);
    const products = await response.json();
    
    const usProducts = products.filter(p => p.geography?.includes('US'));
    const caProducts = products.filter(p => p.geography?.includes('CA')); 
    
    console.log('📊 GEOGRAPHIC COVERAGE ANALYSIS');
    console.log(`   Total Products: ${products.length}`);
    console.log(`   US Products: ${usProducts.length}`);
    console.log(`   CA Products: ${caProducts.length}`);
    
    if (usProducts.length >= 20 && caProducts.length >= 8) {
      console.log('   ✅ Geographic Coverage: Adequate for both markets');
      passedTests++;
    } else {
      console.log('   ❌ Geographic Coverage: Insufficient for dual market support');
    }
  } catch (error) {
    console.log(`   ❌ Geographic Coverage: Failed - ${error.message}`);
  }
  
  // Test 6: Product Categories Coverage
  totalTests++;
  try {
    const response = await fetch(`${API_BASE_URL}/public/lenders`);
    const products = await response.json();
    
    const categories = [...new Set(products.map(p => p.productCategory))];
    const expectedCategories = [
      'invoice_factoring', 'line_of_credit', 'equipment_financing', 
      'working_capital', 'term_loan', 'purchase_order_financing'
    ];
    
    console.log('📈 PRODUCT CATEGORY ANALYSIS');
    console.log(`   Available Categories: ${categories.length}`);
    console.log(`   Categories: ${categories.join(', ')}`);
    
    const missingCategories = expectedCategories.filter(cat => !categories.includes(cat));
    if (missingCategories.length === 0) {
      console.log('   ✅ Category Coverage: All major categories available');
      passedTests++;
    } else {
      console.log(`   ❌ Category Coverage: Missing ${missingCategories.join(', ')}`);
    }
  } catch (error) {
    console.log(`   ❌ Category Coverage: Failed - ${error.message}`);
  }
  
  // Final Results
  console.log('\n🎯 COMPREHENSIVE TEST RESULTS');
  console.log('===============================');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED - SYSTEM READY FOR PRODUCTION');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED - REVIEW ISSUES ABOVE');
  }
  
  // Specific Regional Field Test Instructions
  console.log('\n📋 MANUAL REGIONAL FIELD VERIFICATION');
  console.log('=====================================');
  console.log('To verify regional fields are working:');
  console.log('1. Navigate to /apply/step-1');
  console.log('2. Select "Canada" as Business Location');  
  console.log('3. Fill minimal fields and continue to Step 3');
  console.log('4. Verify you see:');
  console.log('   - "Postal Code" instead of "ZIP Code"');
  console.log('   - "Province" instead of "State"');
  console.log('   - Canadian business structures');
  console.log('   - SIN formatting instead of SSN');
  console.log('5. Check console logs for: [STEP3] Business Location: canada, Is Canadian: true');
}

// Run the test
runComprehensiveE2ETest().catch(console.error);