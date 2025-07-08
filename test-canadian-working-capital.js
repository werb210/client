/**
 * Test Canadian Working Capital Scenario
 * Verify the exact intersection logic for the AccordAccess scenario
 */

async function testCanadianWorkingCapital() {
  console.log('🇨🇦 Testing Canadian Working Capital Scenario\n');
  
  // Test data matching the user scenario
  const testData = {
    selectedProductType: 'Working Capital',
    businessLocation: 'canada',
    fundingAmount: 40000
  };
  
  console.log('Test Parameters:', testData);
  
  try {
    // Fetch products from API
    const response = await fetch('https://staff.boreal.financial/api/public/lenders');
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success || !data.products) {
      throw new Error('Invalid API response');
    }
    
    const allLenders = data.products;
    console.log(`\n📦 Found ${allLenders.length} total products`);
    
    // Map business location to country code
    const countryCode = testData.businessLocation === 'canada' ? 'CA' : 'US';
    console.log(`🌍 Mapping location: ${testData.businessLocation} → ${countryCode}`);
    
    // Filter matching products using the same logic as intersection
    const eligibleLenders = allLenders.filter(product => {
      // Category match - test all approaches
      const productCategory = product.category?.toLowerCase().replace(/\s+/g, '_');
      const searchCategory = testData.selectedProductType?.toLowerCase().replace(/\s+/g, '_');
      
      const directMatch = product.category?.toLowerCase() === testData.selectedProductType?.toLowerCase();
      const normalizedMatch = productCategory === searchCategory;
      const underscoreToSpaceMatch = product.category === testData.selectedProductType?.replace(/_/g, ' ');
      const spaceToUnderscoreMatch = product.category?.replace(/\s+/g, '_').toLowerCase() === testData.selectedProductType?.toLowerCase();
      
      const categoryMatch = directMatch || normalizedMatch || underscoreToSpaceMatch || spaceToUnderscoreMatch;
      
      // Country match
      const countryMatch = product.country === countryCode;
      
      // Amount range match
      const minAmount = product.amountMin || 0;
      const maxAmount = product.amountMax || Number.MAX_SAFE_INTEGER;
      const amountMatch = minAmount <= testData.fundingAmount && maxAmount >= testData.fundingAmount;
      
      console.log(`\n🔍 ${product.name} (${product.lenderName}):`);
      console.log(`   Category: "${product.category}" vs "${testData.selectedProductType}"`);
      console.log(`   directMatch: ${directMatch}`);
      console.log(`   normalizedMatch: ${normalizedMatch} ("${productCategory}" vs "${searchCategory}")`);
      console.log(`   underscoreToSpaceMatch: ${underscoreToSpaceMatch}`);
      console.log(`   spaceToUnderscoreMatch: ${spaceToUnderscoreMatch}`);
      console.log(`   → categoryMatch: ${categoryMatch}`);
      console.log(`   Country: "${product.country}" vs "${countryCode}" → ${countryMatch}`);
      console.log(`   Amount: ${minAmount}-${maxAmount} vs ${testData.fundingAmount} → ${amountMatch}`);
      console.log(`   → OVERALL MATCH: ${categoryMatch && countryMatch && amountMatch}`);
      
      return categoryMatch && countryMatch && amountMatch;
    });
    
    console.log(`\n✅ Found ${eligibleLenders.length} eligible lenders:`);
    eligibleLenders.forEach(lender => {
      console.log(`   - ${lender.lenderName}: ${lender.name}`);
      console.log(`     Documents: ${lender.requiredDocuments?.join(', ') || 'None'}`);
    });
    
    // Check specifically for AccordAccess
    const accordAccess = allLenders.find(p => p.name === 'AccordAccess');
    if (accordAccess) {
      console.log(`\n🎯 AccordAccess Product Details:`);
      console.log(`   Name: ${accordAccess.name}`);
      console.log(`   Lender: ${accordAccess.lenderName}`);
      console.log(`   Category: "${accordAccess.category}"`);
      console.log(`   Country: "${accordAccess.country}"`);
      console.log(`   Amount: ${accordAccess.amountMin}-${accordAccess.amountMax}`);
      console.log(`   Documents: ${accordAccess.requiredDocuments?.join(', ')}`);
      
      const isMatch = eligibleLenders.some(p => p.id === accordAccess.id);
      console.log(`   → MATCHED: ${isMatch}`);
    } else {
      console.log(`\n❌ AccordAccess product not found in API response`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testCanadianWorkingCapital();