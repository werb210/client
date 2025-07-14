/**
 * STEP 2 MAPPING LIVE TEST
 * Run this in browser console to verify step-based structure compliance
 */

async function runStep2MappingTest() {
  console.log('=== STEP 2 MAPPING COMPLIANCE TEST ===\n');
  
  // Test 1: Verify Step 1 data is stored in step1 object
  const formDataContext = window.formDataContext || {};
  const state = formDataContext.state || {};
  
  console.log('✅ Step 1 data structure:');
  console.log('state.step1:', state.step1);
  console.log('');
  
  // Test 2: Verify Step 2 selection is stored in step2 object
  console.log('✅ Step 2 data structure:');
  console.log('state.step2:', state.step2);
  console.log('');
  
  // Test 3: Check for any legacy flat fields (should be undefined)
  console.log('❌ Legacy flat fields (should all be undefined):');
  console.log('state.selectedCategory:', state.selectedCategory);
  console.log('state.requestedAmount:', state.requestedAmount);
  console.log('state.businessName:', state.businessName);
  console.log('state.yearsInBusiness:', state.yearsInBusiness);
  console.log('state.annualRevenue:', state.annualRevenue);
  console.log('');
  
  // Test 4: Verify Step 2 recommendation data flow
  if (state.step1) {
    const formData = {
      headquarters: state.step1.businessLocation || state.step1.headquarters || 'US',
      industry: state.step1.industry,
      lookingFor: state.step1.lookingFor,
      fundingAmount: state.step1.fundingAmount,
      fundsPurpose: state.step1.fundsPurpose,
      accountsReceivableBalance: state.step1.accountsReceivableBalance || 0
    };
    
    console.log('✅ Mapped data for recommendation engine:');
    console.log(formData);
    console.log('');
    
    // Test 5: Verify required fields are present
    const requiredFields = ['headquarters', 'lookingFor', 'fundingAmount'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length === 0) {
      console.log('✅ All required fields present for filtering');
    } else {
      console.log('❌ Missing required fields:', missingFields);
    }
  } else {
    console.log('❌ No Step 1 data found - need to complete Step 1 first');
  }
  
  console.log('\n=== TEST COMPLETE ===');
  
  return {
    step1Present: !!state.step1,
    step2Present: !!state.step2,
    legacyFieldsRemoved: !state.selectedCategory && !state.requestedAmount,
    hasRequiredData: !!(state.step1?.headquarters && state.step1?.lookingFor && state.step1?.fundingAmount)
  };
}

// Make available globally
window.runStep2MappingTest = runStep2MappingTest;