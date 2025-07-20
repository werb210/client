// Server-side script to check for Advance Funds Network products
const https = require('https');

console.log('🔍 Checking staff backend for Advance Funds Network products...');

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
      
      console.log('📊 Total products received:', products.length);
      
      // Search for Advance Funds Network
      const advanceFunds = products.filter(p => 
        p.lender_name?.toLowerCase().includes('advance funds') ||
        p.lender_name?.toLowerCase().includes('advance fund') ||
        p.name?.toLowerCase().includes('advance funds') ||
        p.name?.toLowerCase().includes('advance fund')
      );
      
      console.log('🎯 Advance Funds Network products found:', advanceFunds.length);
      
      if (advanceFunds.length > 0) {
        console.log('📋 Advance Funds Network Products:');
        advanceFunds.forEach((product, index) => {
          console.log(`${index + 1}. ${product.name}`);
          console.log(`   Lender: ${product.lender_name}`);
          console.log(`   Category: ${product.category}`);
          console.log(`   Country: ${product.country}`);
          console.log(`   Amount: $${product.min_amount?.toLocaleString()} - $${product.max_amount?.toLocaleString()}`);
          console.log(`   Active: ${product.is_active}`);
          console.log(`   Product Type: ${product.product_type}`);
          console.log('---');
        });
      } else {
        console.log('❌ No Advance Funds Network products found');
        
        // Show sample of all lenders
        const uniqueLenders = [...new Set(products.map(p => p.lender_name))].sort();
        console.log('🏦 All lenders in database:');
        uniqueLenders.forEach((lender, index) => {
          console.log(`${index + 1}. ${lender}`);
        });
      }
      
      // Check Working Capital products for Canada $40k
      const canadianWorkingCapital = products.filter(p => 
        p.country === 'CA' &&
        p.min_amount <= 40000 &&
        p.max_amount >= 40000 &&
        (p.category?.toLowerCase().includes('working capital') ||
         p.product_type?.toLowerCase().includes('working_capital') ||
         p.name?.toLowerCase().includes('working capital'))
      );
      
      console.log('💼 Canadian Working Capital products for $40,000:', canadianWorkingCapital.length);
      canadianWorkingCapital.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.lender_name})`);
        console.log(`   Category: ${product.category}`);
        console.log(`   Amount: $${product.min_amount?.toLocaleString()} - $${product.max_amount?.toLocaleString()}`);
      });
      
    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      console.log('Raw response:', data.substring(0, 500));
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.end();