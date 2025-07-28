/**
 * Test Canadian Working Capital Filtering
 * Tests the exact scenario: Working capital, $40,000 in Canada
 */

const API_BASE_URL = 'https://staff.boreal.financial/api';
const BEARER_TOKEN = process.env.CLIENT_APP_SHARED_TOKEN || 'your-token-here';

async function testCanadianFiltering() {
  console.log('🇨🇦 Testing Canadian Working Capital Filtering');
  console.log('Scenario: Working capital, $40,000 in Canada');
  console.log('=' * 50);

  try {
    // Test the filtering API endpoint
    const filterParams = new URLSearchParams({
      country: 'canada',
      lookingFor: 'capital',
      fundingAmount: '$40,000',
      fundsPurpose: 'working_capital'
    });

    const filterUrl = `${API_BASE_URL}/loan-products/categories?${filterParams}`;
    console.log('🔍 Testing filter endpoint:', filterUrl);

    const filterResponse = await fetch(filterUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Filter Status: ${filterResponse.status} ${filterResponse.statusText}`);

    if (filterResponse.ok) {
      const filterData = await filterResponse.json();
      console.log('✅ Filter Response:', JSON.stringify(filterData, null, 2));
      
      if (filterData.success && filterData.data) {
        const totalProducts = filterData.data.reduce((sum, category) => sum + category.count, 0);
        console.log(`\n📊 RESULT: ${totalProducts} lender products available for Canadian working capital $40,000`);
        
        console.log('\n📋 Breakdown by category:');
        filterData.data.forEach(category => {
          console.log(`  • ${category.category}: ${category.count} products`);
        });
      }
    } else {
      const errorText = await filterResponse.text();
      console.log('❌ Filter Error:', errorText);
    }

    // Also test direct lender products fetch
    console.log('\n🌍 Testing direct lender products fetch...');
    
    const lendersResponse = await fetch(`${API_BASE_URL}/public/lenders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Lenders Status: ${lendersResponse.status} ${lendersResponse.statusText}`);

    if (lendersResponse.ok) {
      const lendersData = await lendersResponse.json();
      console.log(`📦 Total products in database: ${lendersData.length}`);
      
      // Filter Canadian products manually
      const canadianProducts = lendersData.filter(product => 
        product.geography && (
          product.geography.toLowerCase().includes('ca') || 
          product.geography.toLowerCase().includes('canada')
        )
      );
      
      console.log(`🇨🇦 Canadian products: ${canadianProducts.length}`);
      
      // Filter by amount ($40,000)
      const amountFilteredProducts = canadianProducts.filter(product => {
        const minAmount = product.amountMin || 0;
        const maxAmount = product.amountMax || Infinity;
        return 40000 >= minAmount && 40000 <= maxAmount;
      });
      
      console.log(`💰 Products for $40,000: ${amountFilteredProducts.length}`);
      
      // Filter by working capital/capital
      const capitalProducts = amountFilteredProducts.filter(product => {
        const productType = product.productCategory || product.product || '';
        return productType.toLowerCase().includes('capital') || 
               productType.toLowerCase().includes('working') ||
               productType.toLowerCase().includes('line_of_credit') ||
               productType.toLowerCase().includes('term_loan');
      });
      
      console.log(`💼 Working capital products: ${capitalProducts.length}`);
      
      if (capitalProducts.length > 0) {
        console.log('\n📋 Available products:');
        capitalProducts.forEach((product, index) => {
          console.log(`${index + 1}. ${product.name || product.lender} - ${product.productCategory || product.product}`);
          console.log(`   Amount: $${product.amountMin?.toLocaleString()} - $${product.amountMax?.toLocaleString()}`);
          console.log(`   Geography: ${product.geography}`);
        });
      }
    } else {
      const errorText = await lendersResponse.text();
      console.log('❌ Lenders Error:', errorText);
    }

  } catch (error) {
    console.error('🚨 Test Error:', error.message);
  }

  console.log('\n' + '=' * 50);
  console.log('🎯 Canadian Filtering Test Complete');
}

// Run the test
testCanadianFiltering().catch(console.error);