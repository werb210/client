/**
 * Check Lender Product Count - Get exact numbers from all sources
 */

async function checkLenderCount() {
  console.log('📊 Checking Lender Product Count from All Sources\n');
  
  // 1. Check Staff API directly
  try {
    console.log('🔗 Checking Staff API...');
    const response = await fetch('https://staff.boreal.financial/api/public/lenders');
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.products) {
        console.log(`✅ Staff API: ${data.products.length} products`);
        
        // Count by country
        const byCountry = data.products.reduce((acc, p) => {
          acc[p.country] = (acc[p.country] || 0) + 1;
          return acc;
        }, {});
        console.log('   By Country:', byCountry);
        
        // Count by category
        const byCategory = data.products.reduce((acc, p) => {
          acc[p.category] = (acc[p.category] || 0) + 1;
          return acc;
        }, {});
        console.log('   By Category:', byCategory);
      } else {
        console.log('❌ Staff API: Invalid response structure');
      }
    } else {
      console.log(`❌ Staff API: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Staff API Error: ${error.message}`);
  }
  
  console.log('\n');
  
  // 2. Check what Step 2 sees
  try {
    console.log('🔄 Checking Step 2 API endpoint...');
    const response = await fetch('http://localhost:5000/api/loan-products/categories?country=canada&lookingFor=capital&fundingAmount=%2440%2C000&fundsPurpose=working_capital');
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        const totalProducts = data.data.reduce((sum, cat) => sum + cat.count, 0);
        console.log(`✅ Step 2 API: ${totalProducts} matching products`);
        console.log('   Categories:', data.data.map(c => `${c.category}: ${c.count}`).join(', '));
      } else {
        console.log('❌ Step 2 API: Invalid response');
      }
    } else {
      console.log(`❌ Step 2 API: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Step 2 API Error: ${error.message}`);
  }
}

// Run the check
checkLenderCount();