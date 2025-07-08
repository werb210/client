/**
 * Debug Working Capital Test - Check exact API data and intersection logic
 */

async function testWorkingCapitalIntersection() {
  console.log('🔍 Testing Working Capital Intersection Logic');
  
  try {
    // Fetch actual API data
    const response = await fetch('https://staff.boreal.financial/api/public/lenders');
    const data = await response.json();
    
    if (!data.success || !data.products) {
      console.error('❌ API Error:', data);
      return;
    }
    
    const allProducts = data.products;
    console.log(`📊 Total products: ${allProducts.length}`);
    
    // Test parameters
    const testParams = {
      selectedProductType: 'working_capital',
      businessLocation: 'canada',
      fundingAmount: 40000
    };
    
    console.log('🎯 Test Parameters:', testParams);
    
    // Map business location to country code
    const countryCode = testParams.businessLocation === 'united-states' ? 'US' : 
                       testParams.businessLocation === 'canada' ? 'CA' : 
                       testParams.businessLocation;
    
    console.log(`🌍 Location mapping: ${testParams.businessLocation} → ${countryCode}`);
    
    // Show all Canadian products first
    const canadianProducts = allProducts.filter(p => p.country === 'CA');
    console.log(`🇨🇦 Canadian products: ${canadianProducts.length}`);
    canadianProducts.forEach(p => {
      console.log(`   - ${p.lenderName}: ${p.name} [${p.category}] $${p.amountMin}-${p.amountMax}`);
    });
    
    // Show all Working Capital products
    const workingCapitalProducts = allProducts.filter(p => {
      const productCategory = p.category?.toLowerCase().replace(/\s+/g, '_');
      const searchCategory = testParams.selectedProductType?.toLowerCase().replace(/\s+/g, '_');
      return productCategory === searchCategory || p.category?.toLowerCase() === testParams.selectedProductType?.toLowerCase();
    });
    console.log(`💼 Working Capital products: ${workingCapitalProducts.length}`);
    workingCapitalProducts.forEach(p => {
      console.log(`   - ${p.lenderName}: ${p.name} [${p.category}] ${p.country} $${p.amountMin}-${p.amountMax}`);
      console.log(`     Required docs: [${p.requiredDocuments?.join(', ') || 'none'}]`);
    });
    
    // Filter matching products (exact intersection logic)
    const eligibleLenders = allProducts.filter(product => {
      // Category match - handle multiple formats
      const productCategory = product.category?.toLowerCase().replace(/\s+/g, '_');
      const searchCategory = testParams.selectedProductType?.toLowerCase().replace(/\s+/g, '_');
      const categoryMatch = productCategory === searchCategory || 
                           product.category?.toLowerCase() === testParams.selectedProductType?.toLowerCase();
      
      // Country match
      const countryMatch = product.country === countryCode;
      
      // Amount range match
      const amountMatch = product.amountMin <= testParams.fundingAmount && product.amountMax >= testParams.fundingAmount;

      console.log(`🔍 ${product.name} (${product.lenderName}): category="${product.category}"→"${productCategory}" vs "${searchCategory}" = ${categoryMatch}, country="${product.country}" vs "${countryCode}" = ${countryMatch}, amount=${product.amountMin}-${product.amountMax} vs ${testParams.fundingAmount} = ${amountMatch}`);
      
      return categoryMatch && countryMatch && amountMatch;
    });

    console.log(`✅ ELIGIBLE LENDERS: ${eligibleLenders.length}`);
    eligibleLenders.forEach(lender => {
      console.log(`   - ${lender.lenderName}: ${lender.name}`);
      console.log(`     Required documents: [${lender.requiredDocuments?.join(', ') || 'none'}]`);
    });
    
    // Calculate document intersection
    const allRequiredDocs = eligibleLenders.map(product => product.requiredDocuments || []);
    
    if (allRequiredDocs.length === 0) {
      console.log('❌ No eligible lenders found');
      return;
    }
    
    // Compute intersection of all sets
    let intersection = allRequiredDocs[0];
    for (let i = 1; i < allRequiredDocs.length; i++) {
      intersection = intersection.filter(doc => allRequiredDocs[i].includes(doc));
    }
    
    console.log(`📋 DOCUMENT INTERSECTION: [${intersection.join(', ')}]`);
    console.log(`📊 Final result: ${intersection.length} common documents required by all ${eligibleLenders.length} lenders`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testWorkingCapitalIntersection();