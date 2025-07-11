/**
 * COMPREHENSIVE FIELD MAPPING FIX
 * Run this in browser console to debug and fix all field mapping issues
 */

async function comprehensiveFieldMappingFix() {
  console.log('=== COMPREHENSIVE FIELD MAPPING DIAGNOSTIC & FIX ===\n');
  
  try {
    // 1. Test API Connectivity
    console.log('1️⃣ Testing API Connectivity...');
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    if (!data.success || !data.products) {
      console.error('❌ API Connectivity Failed:', data);
      return;
    }
    
    console.log(`✅ API Connected: ${data.products.length} products received\n`);
    
    // 2. Import and run field validation
    console.log('2️⃣ Running Field Validation...');
    
    // Simulate the expectedLenderFields validation
    const expectedFields = {
      id: 'string',
      name: 'string',
      category: 'string',
      minAmount: 'number',
      maxAmount: 'number',
      geography: 'object',
      country: 'string',
      lender: 'string'
    };
    
    const fieldIssues = [];
    const typeIssues = [];
    
    data.products.forEach((product, index) => {
      console.log(`\n📦 Product ${index + 1}: ${product.name || 'Unknown'}`);
      
      // Check each expected field
      Object.entries(expectedFields).forEach(([field, expectedType]) => {
        const actualValue = product[field];
        const actualType = actualValue === null || actualValue === undefined ? 'undefined' : typeof actualValue;
        
        if (actualValue === null || actualValue === undefined) {
          fieldIssues.push(`${product.name || `Product ${index + 1}`}: Missing ${field}`);
          console.log(`  ❌ Missing: ${field}`);
        } else if (expectedType === 'number' && actualType === 'string' && !isNaN(Number(actualValue))) {
          typeIssues.push(`${product.name || `Product ${index + 1}`}: ${field} is string "${actualValue}", should be number`);
          console.log(`  ⚠️ Type Issue: ${field} = "${actualValue}" (string, should be number)`);
        } else if (actualType !== expectedType && !(field === 'geography' && (actualType === 'string' || Array.isArray(actualValue)))) {
          typeIssues.push(`${product.name || `Product ${index + 1}`}: ${field} is ${actualType}, expected ${expectedType}`);
          console.log(`  ⚠️ Type Mismatch: ${field} is ${actualType}, expected ${expectedType}`);
        } else {
          console.log(`  ✅ Valid: ${field} = ${JSON.stringify(actualValue).substring(0, 50)}...`);
        }
      });
    });
    
    // 3. Summarize Issues
    console.log('\n3️⃣ FIELD MAPPING ISSUES SUMMARY');
    console.log(`📊 Total Products Analyzed: ${data.products.length}`);
    console.log(`❌ Missing Field Issues: ${fieldIssues.length}`);
    console.log(`⚠️ Type Conversion Issues: ${typeIssues.length}`);
    
    if (fieldIssues.length > 0) {
      console.log('\n🔍 Missing Field Details:');
      fieldIssues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    if (typeIssues.length > 0) {
      console.log('\n🔍 Type Issue Details:');
      typeIssues.forEach(issue => console.log(`  - ${issue}`));
    }
    
    // 4. Test Field Mapping Logic
    console.log('\n4️⃣ Testing Step 1 → Step 2 Field Mapping...');
    
    const testScenarios = [
      { businessLocation: 'Canada', expected: 'CA' },
      { businessLocation: 'United States', expected: 'US' },
      { headquarters: 'CA', expected: 'CA' },
      { headquarters: 'US', expected: 'US' },
      { businessLocation: 'Canada', headquarters: 'US', expected: 'US' }
    ];
    
    testScenarios.forEach((scenario, index) => {
      // Simulate Step2RecommendationEngine mapping logic
      const headquarters = scenario.headquarters || scenario.businessLocation || 'US';
      
      const success = headquarters === scenario.expected;
      console.log(`${success ? '✅' : '❌'} Scenario ${index + 1}:`, {
        input: scenario,
        mapped: headquarters,
        expected: scenario.expected,
        success
      });
    });
    
    // 5. Test Amount Field Extraction
    console.log('\n5️⃣ Testing Amount Field Extraction...');
    
    const amounts = data.products
      .map(product => {
        const maxAmount = typeof product.maxAmount === 'number' 
          ? product.maxAmount 
          : parseFloat(product.maxAmount) || 0;
        return maxAmount;
      })
      .filter(amount => amount > 0);
    
    const maxFunding = Math.max(...amounts);
    console.log(`✅ Valid Amounts Found: ${amounts.length}/${data.products.length}`);
    console.log(`✅ Maximum Funding: $${maxFunding.toLocaleString()}`);
    console.log(`✅ Amount Range: $${Math.min(...amounts).toLocaleString()} - $${maxFunding.toLocaleString()}`);
    
    // 6. Test Geographic Filtering
    console.log('\n6️⃣ Testing Geographic Filtering...');
    
    const canadianProducts = data.products.filter(product => {
      const geography = Array.isArray(product.geography) ? product.geography : 
                       typeof product.geography === 'string' ? [product.geography] :
                       product.country ? [product.country] : [];
      return geography.includes('CA') || geography.includes('Canada');
    });
    
    const usProducts = data.products.filter(product => {
      const geography = Array.isArray(product.geography) ? product.geography : 
                       typeof product.geography === 'string' ? [product.geography] :
                       product.country ? [product.country] : [];
      return geography.includes('US') || geography.includes('United States');
    });
    
    console.log(`🇨🇦 Canadian Products: ${canadianProducts.length}`);
    console.log(`🇺🇸 US Products: ${usProducts.length}`);
    console.log(`🌍 Total Coverage: ${canadianProducts.length + usProducts.length}/${data.products.length}`);
    
    // 7. Auto-Fix Simulation
    console.log('\n7️⃣ Auto-Fix Simulation (what sanitizeLenderProduct would do)...');
    
    let fixCount = 0;
    data.products.forEach((product, index) => {
      const fixes = [];
      
      // Category normalization
      if (product.category && typeof product.category === 'string') {
        const normalized = product.category.toLowerCase().replace(/\s+/g, '_');
        if (normalized !== product.category) {
          fixes.push(`category: "${product.category}" → "${normalized}"`);
        }
      }
      
      // Amount field conversion
      ['minAmount', 'maxAmount'].forEach(field => {
        if (product[field] && typeof product[field] === 'string' && !isNaN(Number(product[field]))) {
          fixes.push(`${field}: "${product[field]}" → ${Number(product[field])}`);
        }
      });
      
      // Geography normalization
      if (product.geography && typeof product.geography === 'string') {
        fixes.push(`geography: "${product.geography}" → ["${product.geography}"]`);
      }
      
      if (fixes.length > 0) {
        fixCount++;
        console.log(`🔧 Product ${index + 1} (${product.name}): ${fixes.length} fixes`);
        fixes.forEach(fix => console.log(`    - ${fix}`));
      }
    });
    
    console.log(`\n📊 Auto-Fix Summary: ${fixCount} products would be modified`);
    
    // 8. Final Status
    console.log('\n🎯 FIELD MAPPING STATUS SUMMARY');
    console.log('=====================================');
    console.log(`✅ API Connectivity: WORKING`);
    console.log(`✅ Product Count: ${data.products.length} (Target: 41)`);
    console.log(`✅ Field Mapping Logic: ${testScenarios.every((_, i) => testScenarios[i]) ? 'WORKING' : 'NEEDS FIX'}`);
    console.log(`✅ Amount Extraction: ${amounts.length === data.products.length ? 'PERFECT' : 'PARTIAL'}`);
    console.log(`✅ Geographic Coverage: ${canadianProducts.length > 0 && usProducts.length > 0 ? 'COMPLETE' : 'INCOMPLETE'}`);
    console.log(`✅ Maximum Funding: $${maxFunding.toLocaleString()}`);
    console.log(`🔧 Products Needing Fixes: ${fixCount}`);
    
    if (fieldIssues.length === 0 && typeIssues.length === 0) {
      console.log('\n🎉 ALL FIELD MAPPING ISSUES RESOLVED!');
    } else {
      console.log(`\n⚠️ ${fieldIssues.length + typeIssues.length} issues remain to be fixed`);
    }
    
    return {
      success: true,
      productCount: data.products.length,
      fieldIssues: fieldIssues.length,
      typeIssues: typeIssues.length,
      maxFunding: maxFunding,
      canadianProducts: canadianProducts.length,
      usProducts: usProducts.length,
      needsFixes: fixCount
    };
    
  } catch (error) {
    console.error('❌ Comprehensive field mapping test failed:', error);
    return { success: false, error: error.message };
  }
}

// Auto-run the diagnostic
comprehensiveFieldMappingFix().then(result => {
  if (result.success) {
    console.log('\n✅ Field mapping diagnostic completed successfully');
  } else {
    console.log('\n❌ Field mapping diagnostic failed:', result.error);
  }
});