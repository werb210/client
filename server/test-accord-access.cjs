// Test Accord Access category specifically
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
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      const products = response.products || response;
      
      // Find Accord Access specifically
      const accordAccess = products.find(p => 
        p.name === 'Accord Access' || 
        p.product_name === 'Accord Access'
      );
      
      if (accordAccess) {
        console.log('✅ Accord Access found:');
        console.log(`   Name: "${accordAccess.name}"`);
        console.log(`   Category: "${accordAccess.category}"`);
        console.log(`   Lender: "${accordAccess.lender_name}"`);
        console.log(`   Country: "${accordAccess.country}"`);
        console.log(`   Min Amount: ${accordAccess.min_amount}`);
        console.log(`   Max Amount: ${accordAccess.max_amount}`);
        console.log(`   Active: ${accordAccess.is_active}`);
      } else {
        console.log('❌ Accord Access not found');
        
        // Show all Accord products
        const accordProducts = products.filter(p => 
          p.lender_name?.includes('Accord') || p.name?.includes('Accord')
        );
        console.log('🔍 All Accord products:');
        accordProducts.forEach(p => {
          console.log(`   - "${p.name}" (Category: "${p.category}")`);
        });
      }
      
      // Count Working Capital vs Business Line of Credit for CA
      const canadianProducts = products.filter(p => p.country === 'CA');
      const workingCapital = canadianProducts.filter(p => p.category === 'Working Capital');
      const businessLine = canadianProducts.filter(p => p.category === 'Business Line of Credit');
      
      console.log(`\n📊 Canadian Categories:`);
      console.log(`   Working Capital: ${workingCapital.length} products`);
      workingCapital.forEach(p => console.log(`     - ${p.name} (${p.lender_name})`));
      
      console.log(`   Business Line of Credit: ${businessLine.length} products`);
      businessLine.forEach(p => console.log(`     - ${p.name} (${p.lender_name})`));
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.end();