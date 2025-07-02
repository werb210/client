// Test API endpoints for lender products
const endpoints = [
  'https://staffportal.replit.app/api/public/lenders',
  'https://staffportal.replit.app/api/lenders', 
  'https://staffportal.replit.app/api/products',
  'https://staffportal.replit.app/api/loan-products',
  'https://staff.replit.app/api/public/lenders',
  'https://staff.replit.app/api/lenders'
];

async function testEndpoints() {
  for (const url of endpoints) {
    try {
      console.log(`\nTesting: ${url}`);
      const response = await fetch(url);
      console.log(`Status: ${response.status}`);
      
      const text = await response.text();
      console.log(`Response: ${text.slice(0, 200)}...`);
      
      if (response.ok) {
        try {
          const data = JSON.parse(text);
          if (data.products && Array.isArray(data.products)) {
            console.log(`✅ Found ${data.products.length} products!`);
            return { url, data };
          }
        } catch (e) {
          console.log('Not JSON response');
        }
      }
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  }
  return null;
}

testEndpoints().then(result => {
  if (result) {
    console.log('\n🎉 SUCCESS! Found working endpoint:', result.url);
  } else {
    console.log('\n❌ No working endpoints found');
  }
});