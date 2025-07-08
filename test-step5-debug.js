/**
 * Debug Step 5 Form State
 * Check what values are actually being passed to intersection logic
 */

// Run this in browser console on Step 5 page
console.log('🔍 Step 5 Debug - Form State Analysis');

// Check localStorage for form data
const autoSaveData = localStorage.getItem('borealFinancialApplicationAutoSave');
if (autoSaveData) {
  try {
    const parsed = JSON.parse(autoSaveData);
    console.log('\n📋 Form State from localStorage:');
    console.log('selectedCategory:', parsed.selectedCategory);
    console.log('businessLocation:', parsed.businessLocation);
    console.log('fundingAmount:', parsed.fundingAmount);
    console.log('accountsReceivableBalance:', parsed.accountsReceivableBalance);
    console.log('lookingFor:', parsed.lookingFor);
  } catch (e) {
    console.log('❌ Error parsing autosave data:', e);
  }
} else {
  console.log('❌ No autosave data found');
}

// Check if we can access React state
if (window.React) {
  console.log('\n🔍 React detected - checking for component state');
}

// Test intersection manually
async function testIntersection() {
  console.log('\n🧪 Manual Intersection Test');
  
  const testParams = {
    selectedProductType: 'Working Capital',
    businessLocation: 'canada', 
    fundingAmount: 40000
  };
  
  console.log('Test params:', testParams);
  
  try {
    const response = await fetch('https://staff.boreal.financial/api/public/lenders');
    const data = await response.json();
    const products = data.products || [];
    
    const matches = products.filter(p => {
      const categoryMatch = p.category?.toLowerCase() === testParams.selectedProductType?.toLowerCase();
      const countryMatch = p.country === 'CA';
      const amountMatch = (p.amountMin || 0) <= testParams.fundingAmount && (p.amountMax || Number.MAX_SAFE_INTEGER) >= testParams.fundingAmount;
      
      if (categoryMatch && countryMatch && amountMatch) {
        console.log(`✅ MATCH: ${p.name} (${p.lenderName}) - Documents: ${p.requiredDocuments?.join(', ')}`);
      }
      
      return categoryMatch && countryMatch && amountMatch;
    });
    
    console.log(`\n📊 Found ${matches.length} matches`);
    
  } catch (error) {
    console.log('❌ Test failed:', error);
  }
}

// Run the test
testIntersection();