/**
 * Direct AccordAccess Debug Test
 * Test the exact scenario that should find AccordAccess
 */

async function testAccordAccessDirect() {
  try {
    console.log('🔍 Testing AccordAccess Direct Match');
    
    // Fetch products directly
    const response = await fetch('https://staff.boreal.financial/api/public/lenders');
    const data = await response.json();
    const products = data.products || [];
    
    console.log(`📊 Total products: ${products.length}`);
    
    // Find AccordAccess
    const accordAccess = products.find(p => p.name === 'AccordAccess');
    console.log('🎯 AccordAccess found:', accordAccess);
    
    // Test parameters
    const testParams = {
      selectedProductType: 'Working Capital',
      businessLocation: 'canada', 
      fundingAmount: 40000
    };
    
    console.log('🧪 Test Parameters:', testParams);
    
    // Manual matching logic
    const countryCode = testParams.businessLocation === 'canada' ? 'CA' : 'US';
    
    // Test AccordAccess specifically
    if (accordAccess) {
      const categoryMatch = accordAccess.category === testParams.selectedProductType;
      const countryMatch = accordAccess.country === countryCode;
      const amountMatch = accordAccess.amountMin <= testParams.fundingAmount && accordAccess.amountMax >= testParams.fundingAmount;
      
      console.log('✅ AccordAccess Match Results:');
      console.log(`   Category: "${accordAccess.category}" === "${testParams.selectedProductType}" = ${categoryMatch}`);
      console.log(`   Country: "${accordAccess.country}" === "${countryCode}" = ${countryMatch}`);
      console.log(`   Amount: ${accordAccess.amountMin} <= ${testParams.fundingAmount} <= ${accordAccess.amountMax} = ${amountMatch}`);
      console.log(`   OVERALL MATCH: ${categoryMatch && countryMatch && amountMatch}`);
    }
    
    // Test all Working Capital products in Canada
    const workingCapitalCA = products.filter(p => 
      p.category === 'Working Capital' && 
      p.country === 'CA' &&
      p.amountMin <= 40000 && 
      p.amountMax >= 40000
    );
    
    console.log('🇨🇦 All Working Capital products in Canada for $40K:');
    workingCapitalCA.forEach(p => {
      console.log(`   - ${p.name} (${p.lenderName}): $${p.amountMin}-$${p.amountMax}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testAccordAccessDirect();