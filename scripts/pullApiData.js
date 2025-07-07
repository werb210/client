/**
 * Pull lender products from staff backend API
 */

const STAFF_API_URL = 'https://staff.boreal.financial/api';

async function pullLenderProducts() {
  console.log('🔄 Pulling lender products from staff backend API...');
  
  const endpoints = [
    `${STAFF_API_URL}/public/lenders`,
    `${STAFF_API_URL}/lenders`,
    `${STAFF_API_URL}/products`,
    `${STAFF_API_URL}/public/products`,
    'https://staff.replit.app/api/public/lenders',
    'https://staff.replit.app/api/lenders'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔄 Trying endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Boreal-Client/1.0'
        },
      });
      
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success with endpoint: ${endpoint}`);
        console.log(`Response type: ${typeof data}`);
        console.log(`Response keys: ${Object.keys(data)}`);
        
        // Handle different response formats
        let products = [];
        if (Array.isArray(data)) {
          products = data;
          console.log(`📊 Found ${products.length} products (direct array)`);
        } else if (data.products && Array.isArray(data.products)) {
          products = data.products;
          console.log(`📊 Found ${products.length} products (data.products)`);
        } else if (data.data && Array.isArray(data.data)) {
          products = data.data;
          console.log(`📊 Found ${products.length} products (data.data)`);
        } else {
          console.log(`Response preview: ${JSON.stringify(data).slice(0, 500)}...`);
          console.log('⚠️  Unknown response format');
          continue;
        }
        
        if (products.length > 0) {
          console.log('📋 Sample product structure:');
          console.log(JSON.stringify(products[0], null, 2));
          
          console.log('\n📊 Products summary:');
          const categories = {};
          products.forEach(product => {
            const category = product.productCategory || product.category || product.type || 'Unknown';
            categories[category] = (categories[category] || 0) + 1;
          });
          
          Object.entries(categories).forEach(([category, count]) => {
            console.log(`  ${category}: ${count} products`);
          });
          
          return { endpoint, products, count: products.length };
        }
        
      } else {
        const errorText = await response.text();
        console.log(`❌ ${endpoint}: ${response.status} - ${errorText.slice(0, 200)}`);
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
  
  throw new Error('All API endpoints failed - no products found');
}

// Run the script
pullLenderProducts()
  .then((result) => {
    console.log('\n🎉 API pull completed successfully!');
    console.log(`✅ Working endpoint: ${result.endpoint}`);
    console.log(`✅ Total products found: ${result.count}`);
  })
  .catch((error) => {
    console.error('\n❌ API pull failed:', error.message);
    console.log('\n💡 Possible issues:');
    console.log('  - Staff backend is not deployed or running');
    console.log('  - API endpoints have changed');
    console.log('  - Network connectivity issues');
    console.log('  - CORS restrictions');
  });