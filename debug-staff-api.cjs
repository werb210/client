const https = require('https');

function fetchLenderProducts() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'staffportal.replit.app',
      port: 443,
      path: '/api/public/lenders',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function main() {
  try {
    const data = await fetchLenderProducts();
    console.log('Raw API Response Structure:');
    console.log(JSON.stringify(data, null, 2).substring(0, 2000) + '...');
    
    const products = Array.isArray(data) ? data : data.products || [];
    console.log(`\nFirst product structure:`);
    if (products.length > 0) {
      console.log(JSON.stringify(products[0], null, 2));
    }
    
    console.log(`\nTotal products: ${products.length}`);
    console.log('Available fields:');
    if (products.length > 0) {
      console.log(Object.keys(products[0]));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();