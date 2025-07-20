// Debug script to check product categories
const https = require('https');

const options = {
  hostname: 'staff.boreal.financial',
  port: 443,
  path: '/api/public/lenders',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + process.env.VITE_CLIENT_APP_SHARED_TOKEN
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      const products = response.products || response;
      
      // Find Accord products
      const accordProducts = products.filter(p => 
        p.lender_name?.toLowerCase().includes('accord') ||
        p.name?.toLowerCase().includes('accord')
      );
      
      console.log('🏦 All Accord Financial Products:');
      accordProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   Lender: ${product.lender_name}`);
        console.log(`   Category: ${product.category}`);
        console.log(`   Product Type: ${product.product_type}`);
        console.log(`   Country: ${product.country}`);
        console.log(`   Amount: $${product.min_amount?.toLocaleString()} - $${product.max_amount?.toLocaleString()}`);
        console.log('---');
      });
      
      // Check if Accord Access exists and its category
      const accordAccess = products.find(p => 
        p.name?.toLowerCase().includes('accord access') ||
        p.product_name?.toLowerCase().includes('accord access')
      );
      
      if (accordAccess) {
        console.log('✅ Found Accord Access:');
        console.log(`   Name: ${accordAccess.name}`);
        console.log(`   Category: ${accordAccess.category}`);
        console.log(`   Product Type: ${accordAccess.product_type}`);
        console.log(`   Should be in Working Capital: ${accordAccess.category === 'Working Capital'}`);
      } else {
        console.log('❌ Accord Access not found by name search');
      }
      
      // Check all Canadian products for $40k
      const canadianProducts = products.filter(p => 
        p.country === 'CA' &&
        p.min_amount <= 40000 &&
        p.max_amount >= 40000
      );
      
      console.log(`\n🇨🇦 All Canadian products for $40,000 (${canadianProducts.length} total):`);
      canadianProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.lender_name})`);
        console.log(`   Category: ${product.category}`);
        console.log(`   Product Type: ${product.product_type}`);
        console.log(`   Amount: $${product.min_amount?.toLocaleString()} - $${product.max_amount?.toLocaleString()}`);
        console.log('---');
      });
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.end();