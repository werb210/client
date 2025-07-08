/**
 * LIVE STEP 5 DEBUGGING
 * Run this in browser console while on Step 5 to see exactly what's happening
 */

console.log('🔍 LIVE STEP 5 DEBUG - Form State Analysis');

// 1. Check autosave data
const autoSaveData = localStorage.getItem('borealFinancialApplicationAutoSave');
if (autoSaveData) {
  try {
    const parsed = JSON.parse(autoSaveData);
    console.log('\n📋 Form State from localStorage:');
    console.log('selectedCategory:', parsed.selectedCategory);
    console.log('businessLocation:', parsed.businessLocation);
    console.log('fundingAmount:', parsed.fundingAmount);
    console.log('lookingFor:', parsed.lookingFor);
    console.log('accountsReceivableBalance:', parsed.accountsReceivableBalance);
  } catch (e) {
    console.log('❌ Error parsing autosave data:', e);
  }
} else {
  console.log('❌ No autosave data found');
}

// 2. Test intersection function directly
async function testDirectIntersection() {
  console.log('\n🧪 Direct Intersection Test');
  
  // Test with known working parameters
  const testParams = {
    selectedProductType: 'Working Capital',
    businessLocation: 'canada',
    fundingAmount: 40000
  };
  
  console.log('Test params:', testParams);
  
  try {
    // Import and test the intersection function directly
    const { getDocumentRequirementsIntersection } = await import('/src/lib/documentIntersection.ts');
    
    const result = await getDocumentRequirementsIntersection(
      testParams.selectedProductType,
      testParams.businessLocation, 
      testParams.fundingAmount
    );
    
    console.log('\n📊 Direct intersection result:', result);
    console.log('Eligible lenders:', result.eligibleLenders?.length || 0);
    console.log('Required documents:', result.requiredDocuments?.length || 0);
    console.log('Has matches:', result.hasMatches);
    console.log('Message:', result.message);
    
    if (result.eligibleLenders?.length > 0) {
      console.log('\n✅ Found lenders:');
      result.eligibleLenders.forEach(lender => {
        console.log(`- ${lender.name} (${lender.lenderName})`);
      });
    }
    
    if (result.requiredDocuments?.length > 0) {
      console.log('\n📋 Required documents:');
      result.requiredDocuments.forEach(doc => {
        console.log(`- ${doc}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Direct test failed:', error);
  }
}

// 3. Check API directly
async function testApiDirect() {
  console.log('\n🌐 API Direct Test');
  
  try {
    const response = await fetch('https://staff.boreal.financial/api/public/lenders');
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    const products = data.success ? data.products : [];
    
    console.log(`Found ${products.length} products from API`);
    
    // Find AccordAccess specifically
    const accordAccess = products.find(p => p.name === 'AccordAccess');
    if (accordAccess) {
      console.log('\n🎯 AccordAccess found:', accordAccess);
    } else {
      console.log('\n❌ AccordAccess NOT found in API response');
    }
    
    // Test filtering
    const matches = products.filter(p => {
      const categoryMatch = p.category === 'Working Capital';
      const countryMatch = p.country === 'CA';
      const amountMatch = (p.amountMin || 0) <= 40000 && (p.amountMax || Number.MAX_SAFE_INTEGER) >= 40000;
      
      console.log(`${p.name}: cat=${categoryMatch} country=${countryMatch} amount=${amountMatch}`);
      
      return categoryMatch && countryMatch && amountMatch;
    });
    
    console.log(`\n📊 Manual filter result: ${matches.length} matches`);
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Run tests
testDirectIntersection();
testApiDirect();