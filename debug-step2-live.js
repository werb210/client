/**
 * LIVE STEP 2 DEBUGGING
 * Run this in browser console while on Step 2 to see exactly what's happening
 */

async function debugStep2Live() {
  console.log('🔍 LIVE STEP 2 DEBUG ANALYSIS');
  console.log('='.repeat(50));

  // Check if we're on Step 2
  const step2Element = document.querySelector('[data-testid="step2"]') || 
                      document.querySelector('.step2') ||
                      document.querySelector('h1, h2, h3, h4').textContent?.includes('Recommended');

  if (!step2Element) {
    console.log('❌ Not on Step 2. Navigate to Step 2 first.');
    return;
  }

  try {
    // 1. Check form data in localStorage or sessionStorage
    console.log('\n📋 CHECKING STORED FORM DATA:');
    const formDataKeys = ['formData', 'applicationFormData', 'step1Data', 'businessProfile'];
    
    formDataKeys.forEach(key => {
      const data = localStorage.getItem(key) || sessionStorage.getItem(key);
      if (data) {
        console.log(`Found ${key}:`, JSON.parse(data));
      }
    });

    // 2. Test API directly
    console.log('\n🌐 TESTING API DIRECTLY:');
    const response = await fetch('/api/public/lenders');
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ API Response: ${data.products?.length || 0} products`);
      
      if (data.products?.length > 0) {
        console.log('Sample products:', data.products.slice(0, 3).map(p => ({
          name: p.name || p.lender,
          category: p.category,
          geography: p.geography,
          country: p.country,
          minAmount: p.minAmount,
          maxAmount: p.maxAmount
        })));
      }
    } else {
      console.log(`❌ API Error: ${response.status}`);
    }

    // 3. Check React component state via DOM inspection
    console.log('\n🔍 CHECKING DOM FOR DEBUG INFO:');
    const debugElements = document.querySelectorAll('[data-debug], .debug-info, pre');
    debugElements.forEach(el => {
      if (el.textContent && el.textContent.includes('formData')) {
        console.log('Found debug element:', el.textContent);
      }
    });

    // 4. Check for error messages
    console.log('\n❌ CHECKING FOR ERROR MESSAGES:');
    const errorElements = document.querySelectorAll('.text-red-500, .text-yellow-700, .alert, .error');
    errorElements.forEach(el => {
      console.log('Error element:', el.textContent?.trim());
    });

    // 5. Check for "No Products Found" specific debug
    const noProductsElement = document.querySelector('h4');
    if (noProductsElement && noProductsElement.textContent?.includes('No Products Found')) {
      console.log('\n🚨 "No Products Found" element detected');
      
      // Try to find the debug details
      const debugDetails = noProductsElement.parentElement?.querySelector('pre');
      if (debugDetails) {
        console.log('Debug details found:', debugDetails.textContent);
        try {
          const debugData = JSON.parse(debugDetails.textContent);
          console.log('Parsed debug data:', debugData);
          
          // Analyze the issue
          if (debugData.formData) {
            console.log('\n🔬 ANALYZING FORM DATA:');
            const fd = debugData.formData;
            console.log('- Headquarters:', fd.headquarters);
            console.log('- Funding Amount:', fd.fundingAmount);
            console.log('- Looking For:', fd.lookingFor);
            console.log('- AR Balance:', fd.accountsReceivableBalance);
            console.log('- Purpose:', fd.fundsPurpose);
          }
        } catch (e) {
          console.log('Could not parse debug data:', e.message);
        }
      }
    }

    // 6. Manual test filtering logic
    console.log('\n🧪 MANUAL FILTERING TEST:');
    const testFormData = {
      headquarters: 'US', // or whatever we find
      fundingAmount: 50000,
      lookingFor: 'capital',
      accountsReceivableBalance: 0,
      fundsPurpose: 'working_capital'
    };
    
    console.log('Test form data:', testFormData);
    console.log('This would help identify if specific values are causing issues');

  } catch (error) {
    console.log('❌ Debug error:', error.message);
  }
}

// Auto-run
debugStep2Live();