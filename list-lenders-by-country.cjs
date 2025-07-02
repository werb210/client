const https = require('https');

async function fetchLenderProducts() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'staffportal.replit.app',
      port: 443,
      path: '/api/public/lenders',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Node.js'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

function categorizeByCountry(products) {
  const byCountry = {
    'United States': [],
    'Canada': [],
    'United Kingdom': [],
    'International': [],
    'Other': []
  };

  products.forEach(product => {
    const name = (product.name || product.productName || product.product_name || '').toLowerCase();
    
    if (name.includes('bmo') || name.includes('td bank') || name.includes('rbc') || 
        name.includes('royal bank') || name.includes('scotiabank') || name.includes('cibc')) {
      byCountry['Canada'].push(product);
    } else if (name.includes('capital one') || name.includes('wells fargo') || 
               name.includes('bank of america') || name.includes('chase') || 
               name.includes('citi') || name.includes('us bank') || name.includes('pnc') ||
               name.includes('american express') || name.includes('goldman sachs')) {
      byCountry['United States'].push(product);
    } else if (name.includes('hsbc') || name.includes('barclays') || 
               name.includes('lloyds') || name.includes('natwest')) {
      byCountry['United Kingdom'].push(product);
    } else if (name.includes('deutsche') || name.includes('bnp') || 
               name.includes('credit suisse') || name.includes('ubs')) {
      byCountry['International'].push(product);
    } else {
      byCountry['Other'].push(product);
    }
  });

  return byCountry;
}

function formatAmount(amount) {
  if (!amount) return 'N/A';
  const num = parseFloat(amount);
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(0)}K`;
  }
  return `$${num.toLocaleString()}`;
}

function formatInterestRate(min, max) {
  if (!min && !max) return 'Rate varies';
  if (min && max) {
    return `${(parseFloat(min) * 100).toFixed(1)}% - ${(parseFloat(max) * 100).toFixed(1)}%`;
  }
  if (min) return `From ${(parseFloat(min) * 100).toFixed(1)}%`;
  if (max) return `Up to ${(parseFloat(max) * 100).toFixed(1)}%`;
  return 'Rate varies';
}

async function main() {
  try {
    console.log('Fetching lender products from staff database...\n');
    
    const response = await fetchLenderProducts();
    const products = response.products || [];
    
    console.log(`Found ${products.length} total products\n`);
    
    const byCountry = categorizeByCountry(products);
    
    Object.entries(byCountry).forEach(([country, countryProducts]) => {
      if (countryProducts.length === 0) return;
      
      console.log(`\n## **${country.toUpperCase()} (${countryProducts.length} products)**\n`);
      
      countryProducts.forEach((product, index) => {
        console.log(`${index + 1}. **${product.name}**`);
        console.log(`   - Type: ${product.type ? product.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}`);
        console.log(`   - Amount: ${formatAmount(product.min_amount)} - ${formatAmount(product.max_amount)}`);
        console.log(`   - Interest Rate: ${formatInterestRate(product.interest_rate_min, product.interest_rate_max)}`);
        if (product.description) {
          console.log(`   - Description: ${product.description}`);
        }
        console.log('');
      });
    });
    
    const totalProducts = Object.values(byCountry).reduce((sum, products) => sum + products.length, 0);
    console.log(`\n**Total: ${totalProducts} lender products across ${Object.keys(byCountry).filter(country => byCountry[country].length > 0).length} regions**`);
    
  } catch (error) {
    console.error('Error fetching lender products:', error.message);
  }
}

main();