const http = require('http');

const https = require('https');

const options = {
  hostname: 'staffportal.replit.app',
  port: 443,
  path: '/api/public/lenders',
  method: 'GET'
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Raw API Response Structure:');
      console.log('Keys:', Object.keys(response));
      console.log('');
      
      // Extract products from the response structure
      const products = response.products || response.data || response;
      
      function formatAmount(amount) {
        // Handle both string and number formats from staff API
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numAmount)) return 'N/A';
        
        if (numAmount >= 1000000) {
          return `$${(numAmount/1000000).toFixed(1)}M`;
        } else if (numAmount >= 1000) {
          return `$${(numAmount/1000).toFixed(0)}K`;
        } else {
          return `$${numAmount.toLocaleString()}`;
        }
      }
      
      function formatCategory(category) {
        return category.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }
      
      console.log('='.repeat(80));
      console.log('LENDER PRODUCTS CATALOG - LIVE DATA FROM STAFF API');
      console.log('='.repeat(80));
      console.log(`Total Products: ${products.length}`);
      console.log('');
      
      // Group by category
      const byCategory = {};
      products.forEach(product => {
        const category = product.category;
        if (!byCategory[category]) {
          byCategory[category] = [];
        }
        byCategory[category].push(product);
      });
      
      console.log('📋 BY CATEGORY:');
      console.log('-'.repeat(50));
      
      Object.keys(byCategory).sort().forEach(category => {
        const categoryProducts = byCategory[category];
        const categoryName = formatCategory(category);
        console.log(`\n${categoryName} (${categoryProducts.length} products):`);
        
        categoryProducts.forEach(product => {
          // Handle staff API data structure
          const minAmount = formatAmount(product.amountRange?.min || product.minAmount);
          const maxAmount = formatAmount(product.amountRange?.max || product.maxAmount);
          const productName = product.productName || product.name;
          const lenderName = product.lenderName;
          const geography = product.geography || ['US']; // Default geography
          console.log(`  • ${productName} (${lenderName}) - ${minAmount} to ${maxAmount} [${geography.join(', ')}]`);
        });
      });
      
      console.log('');
      console.log('🏦 BY LENDER:');
      console.log('-'.repeat(50));
      
      // Group by lender
      const byLender = {};
      products.forEach(product => {
        const lender = product.lenderName;
        if (!byLender[lender]) {
          byLender[lender] = [];
        }
        byLender[lender].push(product);
      });
      
      Object.keys(byLender).sort().forEach(lender => {
        const lenderProducts = byLender[lender];
        console.log(`\n${lender} (${lenderProducts.length} products):`);
        
        lenderProducts.forEach(product => {
          const categoryName = formatCategory(product.category);
          const minAmount = formatAmount(product.amountRange?.min || product.minAmount);
          const maxAmount = formatAmount(product.amountRange?.max || product.maxAmount);
          const productName = product.productName || product.name;
          const geography = product.geography || ['US']; // Default geography
          console.log(`  • ${productName} - ${categoryName} - ${minAmount} to ${maxAmount} [${geography.join(', ')}]`);
        });
      });
      
      console.log('');
      console.log('='.repeat(80));
      console.log(`Data Source: Live Staff API • ${new Date().toLocaleString()}`);
      console.log('='.repeat(80));
      
    } catch (error) {
      console.error('Error parsing JSON:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error fetching data:', error.message);
});

req.end();