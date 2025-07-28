/**
 * Test Working Capital Document Requirements
 * Tests what documents are required when user selects working capital
 */

async function testWorkingCapitalDocuments() {
  console.log('🔍 Testing Working Capital Document Requirements\n');
  
  const testParams = {
    selectedProductType: 'working_capital',
    businessLocation: 'canada', 
    fundingAmount: 40000
  };
  
  console.log('Test parameters:', testParams);
  
  try {
    // Fetch products from correct API
    const response = await fetch('https://staff.boreal.financial/api/public/lenders');
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success || !data.products) {
      throw new Error('Invalid API response');
    }
    
    const allLenders = data.products;
    console.log(`📦 Found ${allLenders.length} total products\n`);
    
    // Apply the same filtering logic as intersection
    const countryCode = 'CA'; // canada → CA
    const eligibleLenders = allLenders.filter(product => {
      // Category match
      const productCategory = product.category?.toLowerCase().replace(/\s+/g, '_');
      const searchCategory = 'working_capital';
      const categoryMatch = productCategory === searchCategory || 
                           product.category?.toLowerCase() === 'working capital';
      
      // Country match
      const countryMatch = product.country === countryCode;
      
      // Amount range match with safe defaults
      const minAmount = product.amountMin || 0;
      const maxAmount = product.amountMax || Number.MAX_SAFE_INTEGER;
      const amountMatch = minAmount <= 40000 && maxAmount >= 40000;
      
      console.log(`🔍 ${product.name} (${product.lenderName}):`);
      console.log(`   Category: "${product.category}" → "${productCategory}" vs "${searchCategory}" = ${categoryMatch}`);
      console.log(`   Country: "${product.country}" vs "${countryCode}" = ${countryMatch}`);
      console.log(`   Amount: ${minAmount}-${maxAmount} vs 40000 = ${amountMatch}`);
      console.log(`   Match: ${categoryMatch && countryMatch && amountMatch}\n`);
      
      return categoryMatch && countryMatch && amountMatch;
    });
    
    console.log(`✅ Found ${eligibleLenders.length} eligible lenders:`);
    eligibleLenders.forEach(lender => {
      console.log(`   ${lender.lenderName}: ${lender.name}`);
      console.log(`     Documents: ${lender.requiredDocuments?.join(', ') || 'None specified'}`);
    });
    
    if (eligibleLenders.length > 0) {
      // Calculate intersection of required documents
      const allDocuments = eligibleLenders.map(l => l.requiredDocuments || []);
      const intersection = allDocuments.reduce((common, docs) => 
        common.filter(doc => docs.includes(doc))
      );
      
      console.log(`\n📋 Common documents required by ALL ${eligibleLenders.length} lenders:`);
      if (intersection.length > 0) {
        intersection.forEach(doc => console.log(`   ✓ ${doc}`));
      } else {
        console.log('   No common documents required by all lenders');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testWorkingCapitalDocuments();