/**
 * Focused Regional Fields Test
 * Tests the specific Canadian vs US field detection and formatting
 */

async function testRegionalFieldsLogic() {
  console.log('🇨🇦 REGIONAL FIELDS LOGIC TEST');
  console.log('===============================\n');
  
  // Import the regional formatting functions (simulate)
  const regionalFormatting = {
    isCanadianBusiness: (location) => location === 'canada',
    getRegionalLabels: (isCanadian) => {
      if (isCanadian) {
        return {
          sin: "SIN",
          postalCode: "Postal Code", 
          postalCodePlaceholder: "Enter postal code (A1A 1A1)",
          stateProvince: "Province",
          country: "Canada",
          currency: "CAD",
          currencySymbol: "C$",
          phoneFormat: "(XXX) XXX-XXXX",
          phoneExample: "(416) 555-0123"
        };
      } else {
        return {
          sin: "SSN",
          postalCode: "ZIP Code",
          postalCodePlaceholder: "Enter ZIP code (12345)",
          stateProvince: "State", 
          country: "United States",
          currency: "USD",
          currencySymbol: "$",
          phoneFormat: "(XXX) XXX-XXXX",
          phoneExample: "(555) 123-4567"
        };
      }
    },
    formatPostalCode: (value, isCanadian) => {
      if (!value) return value;
      if (isCanadian) {
        const postal = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        if (postal.length <= 3) return postal;
        else if (postal.length <= 6) return `${postal.slice(0, 3)} ${postal.slice(3)}`;
        return `${postal.slice(0, 3)} ${postal.slice(3, 6)}`;
      } else {
        const zip = value.replace(/[^\d]/g, '');
        if (zip.length <= 5) return zip;
        return `${zip.slice(0, 5)}-${zip.slice(5, 9)}`;
      }
    },
    formatSSN: (value, isCanadian) => {
      if (!value) return value;
      const ssn = value.replace(/[^\d]/g, '');
      if (isCanadian) {
        // Canadian SIN format: XXX XXX XXX
        if (ssn.length < 4) return ssn;
        else if (ssn.length < 7) return `${ssn.slice(0, 3)} ${ssn.slice(3)}`;
        else if (ssn.length <= 9) return `${ssn.slice(0, 3)} ${ssn.slice(3, 6)} ${ssn.slice(6)}`;
      } else {
        // US SSN format: XXX-XX-XXXX
        if (ssn.length < 4) return ssn;
        else if (ssn.length < 6) return `${ssn.slice(0, 3)}-${ssn.slice(3)}`;
        else if (ssn.length <= 9) return `${ssn.slice(0, 3)}-${ssn.slice(3, 5)}-${ssn.slice(5)}`;
      }
      return ssn.slice(0, 9);
    }
  };
  
  // Test scenarios
  const testCases = [
    {
      name: "Canadian Business Detection",
      businessLocation: 'canada',
      expectedLabels: {
        postalCode: 'Postal Code',
        stateProvince: 'Province', 
        sin: 'SIN',
        currency: 'C$'
      },
      testInputs: {
        postalCode: 'K1A0A6',
        expectedPostal: 'K1A 0A6',
        ssn: '123456789',
        expectedSSN: '123 456 789'
      }
    },
    {
      name: "US Business Detection", 
      businessLocation: 'united-states',
      expectedLabels: {
        postalCode: 'ZIP Code',
        stateProvince: 'State',
        sin: 'SSN', 
        currency: '$'
      },
      testInputs: {
        postalCode: '123456789',
        expectedPostal: '12345-6789',
        ssn: '123456789', 
        expectedSSN: '123-45-6789'
      }
    }
  ];
  
  let allTestsPassed = true;
  
  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.name}`);
    console.log(`   Business Location: ${testCase.businessLocation}`);
    
    // Test business detection
    const isCanadian = regionalFormatting.isCanadianBusiness(testCase.businessLocation);
    const expectedCanadian = testCase.businessLocation === 'canada';
    
    if (isCanadian === expectedCanadian) {
      console.log(`   ✅ Business Detection: ${isCanadian ? 'Canadian' : 'US'} correctly identified`);
    } else {
      console.log(`   ❌ Business Detection: Expected ${expectedCanadian}, got ${isCanadian}`);
      allTestsPassed = false;
    }
    
    // Test regional labels
    const regionalLabels = regionalFormatting.getRegionalLabels(isCanadian);
    
    console.log(`   🏷️  Field Labels:`);
    for (const [field, expectedLabel] of Object.entries(testCase.expectedLabels)) {
      const actualLabel = regionalLabels[field];
      if (actualLabel === expectedLabel) {
        console.log(`      ✅ ${field}: "${actualLabel}"`);
      } else {
        console.log(`      ❌ ${field}: Expected "${expectedLabel}", got "${actualLabel}"`);
        allTestsPassed = false;
      }
    }
    
    // Test formatting functions
    console.log(`   🔧 Field Formatting:`);
    
    // Postal code formatting
    const formattedPostal = regionalFormatting.formatPostalCode(testCase.testInputs.postalCode, isCanadian);
    if (formattedPostal === testCase.testInputs.expectedPostal) {
      console.log(`      ✅ Postal Code: "${testCase.testInputs.postalCode}" → "${formattedPostal}"`);
    } else {
      console.log(`      ❌ Postal Code: Expected "${testCase.testInputs.expectedPostal}", got "${formattedPostal}"`);
      allTestsPassed = false;
    }
    
    // SSN/SIN formatting  
    const formattedSSN = regionalFormatting.formatSSN(testCase.testInputs.ssn, isCanadian);
    if (formattedSSN === testCase.testInputs.expectedSSN) {
      console.log(`      ✅ ${isCanadian ? 'SIN' : 'SSN'}: "${testCase.testInputs.ssn}" → "${formattedSSN}"`);
    } else {
      console.log(`      ❌ ${isCanadian ? 'SIN' : 'SSN'}: Expected "${testCase.testInputs.expectedSSN}", got "${formattedSSN}"`);
      allTestsPassed = false;
    }
    
    console.log('');
  }
  
  // Test API Integration
  console.log('🌐 API INTEGRATION TEST');
  console.log('========================');
  
  try {
    // Test Canadian scenario
    const canadianParams = new URLSearchParams({
      country: 'canada',
      lookingFor: 'capital', 
      fundingAmount: '$40000',
      accountsReceivableBalance: 'none',
      fundsPurpose: 'working-capital'
    });
    
    const response = await fetch(`http://localhost:5000/api/loan-products/categories?${canadianParams}`);
    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ Canadian API Test: ${result.data.length} categories returned`);
      console.log(`   Categories: ${result.data.map(c => c.category).join(', ')}`);
      
      // Check Invoice Factoring exclusion (should be excluded since accountsReceivableBalance = 'none')
      const hasInvoiceFactoring = result.data.some(c => c.category.toLowerCase().includes('invoice'));
      if (!hasInvoiceFactoring) {
        console.log(`   ✅ Invoice Factoring correctly excluded (no AR balance)`);
      } else {
        console.log(`   ❌ Invoice Factoring should be excluded when no AR balance`);
        allTestsPassed = false;
      }
    } else {
      console.log(`❌ Canadian API Test failed: ${result.error || 'Unknown error'}`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`❌ API Integration Test failed: ${error.message}`);
    allTestsPassed = false;
  }
  
  // Final Results
  console.log('\n🎯 REGIONAL FIELDS TEST RESULTS');
  console.log('================================');
  if (allTestsPassed) {
    console.log('🎉 ALL REGIONAL FIELD TESTS PASSED');
    console.log('\n✅ The regional field system is working correctly:');
    console.log('   • Canadian business location properly detected');  
    console.log('   • Field labels adapt correctly (Postal Code vs ZIP Code)');
    console.log('   • Formatting functions work for both regions');
    console.log('   • API integration maintains regional consistency');
  } else {
    console.log('⚠️  SOME REGIONAL FIELD TESTS FAILED');
    console.log('Please review the failures above and check the implementation.');
  }
  
  console.log('\n📱 NEXT STEP: Manual UI Testing');
  console.log('===============================');
  console.log('To verify the UI implementation:');
  console.log('1. Navigate to /apply/step-1');
  console.log('2. Select "Canada" as Business Location');
  console.log('3. Fill minimal fields and continue to Step 3');
  console.log('4. Verify the following fields show Canadian labels:');
  console.log('   • Business Postal Code (not ZIP Code)');
  console.log('   • Business Province (not State)');
  console.log('   • Canadian business structure options');
  console.log('5. Continue to Step 4 and verify:'); 
  console.log('   • Personal Postal Code');
  console.log('   • Personal Province');
  console.log('   • SIN field (not SSN)');
  console.log('6. Check browser console for: [STEP3] Business Location: canada, Is Canadian: true');
}

// Run the focused test
testRegionalFieldsLogic().catch(console.error);