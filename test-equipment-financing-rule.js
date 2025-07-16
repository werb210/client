/**
 * TEST EQUIPMENT FINANCING BUSINESS RULE - Step 2 Filtering
 * Copy and paste this into browser console to test the new Equipment Financing exclusion logic
 */

async function testEquipmentFinancingRule() {
  console.log('🧪 TESTING EQUIPMENT FINANCING BUSINESS RULE');
  console.log('============================================');
  
  try {
    // Fetch all products to see what's available
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    if (!data.success || !data.products) {
      console.error('❌ Failed to fetch products');
      return;
    }
    
    const allProducts = data.products;
    console.log(`📦 Starting with ${allProducts.length} total products`);
    
    // Find Equipment Financing products
    const equipmentProducts = allProducts.filter(p => p.category === 'Equipment Financing');
    console.log(`🏭 Found ${equipmentProducts.length} Equipment Financing products:`);
    equipmentProducts.forEach(p => {
      console.log(`   - ${p.name} (${p.lender_name})`);
    });
    
    console.log('');
    
    // Test cases for the business rule
    const testCases = [
      {
        name: 'SHOULD SHOW Equipment Financing - lookingFor=equipment',
        formData: {
          headquarters: 'CA',
          lookingFor: 'equipment',
          fundingAmount: 50000,
          accountsReceivableBalance: 0,
          fundsPurpose: 'working_capital'
        },
        expectEquipmentFinancing: true
      },
      {
        name: 'SHOULD SHOW Equipment Financing - lookingFor=both',
        formData: {
          headquarters: 'CA',
          lookingFor: 'both',
          fundingAmount: 50000,
          accountsReceivableBalance: 0,
          fundsPurpose: 'working_capital'
        },
        expectEquipmentFinancing: true
      },
      {
        name: 'SHOULD SHOW Equipment Financing - fundsPurpose=equipment',
        formData: {
          headquarters: 'CA',
          lookingFor: 'capital',
          fundingAmount: 50000,
          accountsReceivableBalance: 0,
          fundsPurpose: 'equipment'
        },
        expectEquipmentFinancing: true
      },
      {
        name: 'SHOULD HIDE Equipment Financing - lookingFor=capital + fundsPurpose=working_capital',
        formData: {
          headquarters: 'CA',
          lookingFor: 'capital',
          fundingAmount: 50000,
          accountsReceivableBalance: 0,
          fundsPurpose: 'working_capital'
        },
        expectEquipmentFinancing: false
      },
      {
        name: 'SHOULD HIDE Equipment Financing - lookingFor=capital + fundsPurpose=expansion',
        formData: {
          headquarters: 'CA',
          lookingFor: 'capital',
          fundingAmount: 50000,
          accountsReceivableBalance: 0,
          fundsPurpose: 'expansion'
        },
        expectEquipmentFinancing: false
      }
    ];
    
    // Run each test case
    for (const testCase of testCases) {
      console.log(`🧪 TEST: ${testCase.name}`);
      console.log(`   Form data: lookingFor="${testCase.formData.lookingFor}", fundsPurpose="${testCase.formData.fundsPurpose}"`);
      
      // Manual filtering to test business rule
      const filteredProducts = allProducts.filter(product => {
        // Basic filters
        const countryMatch = product.country === testCase.formData.headquarters;
        const minAmount = product.min_amount || product.amountMin || 0;
        const maxAmount = product.max_amount || product.amountMax || Number.MAX_SAFE_INTEGER;
        const amountMatch = minAmount <= testCase.formData.fundingAmount && maxAmount >= testCase.formData.fundingAmount;
        
        if (!countryMatch || !amountMatch) return false;
        
        // Equipment Financing business rule
        const isEquipmentFinancing = product.category === 'Equipment Financing';
        if (isEquipmentFinancing) {
          const isEligible = testCase.formData.lookingFor === 'equipment' || 
                            testCase.formData.lookingFor === 'both' || 
                            testCase.formData.fundsPurpose === 'equipment';
          
          console.log(`   🔍 Equipment product "${product.name}": eligible=${isEligible}`);
          return isEligible;
        }
        
        return true;
      });
      
      const hasEquipmentFinancing = filteredProducts.some(p => p.category === 'Equipment Financing');
      const testPassed = hasEquipmentFinancing === testCase.expectEquipmentFinancing;
      
      console.log(`   Expected Equipment Financing: ${testCase.expectEquipmentFinancing}`);
      console.log(`   Actual Equipment Financing: ${hasEquipmentFinancing}`);
      console.log(`   Result: ${testPassed ? '✅ PASS' : '❌ FAIL'}`);
      console.log('');
    }
    
    console.log('🎯 BUSINESS RULE SUMMARY:');
    console.log('Equipment Financing products should ONLY appear when:');
    console.log('  • lookingFor = "equipment" (Equipment Financing), OR');
    console.log('  • lookingFor = "both" (Both Capital & Equipment), OR');
    console.log('  • fundsPurpose = "equipment" (Equipment Purchase)');
    console.log('');
    console.log('In all other cases, Equipment Financing should be hidden from Step 2 recommendations.');
    
  } catch (error) {
    console.error('❌ Error testing Equipment Financing rule:', error);
  }
}

// Run the test
testEquipmentFinancingRule();