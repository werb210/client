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
    'International': [],
    'Other': []
  };

  products.forEach(product => {
    // Use geography field if available
    if (product.geography && Array.isArray(product.geography)) {
      if (product.geography.includes('US')) {
        byCountry['United States'].push(product);
      } else if (product.geography.includes('CA')) {
        byCountry['Canada'].push(product);
      } else {
        byCountry['International'].push(product);
      }
    } else {
      // Fallback: Extract info from description
      const desc = (product.description || '').toLowerCase();
      const name = (product.name || product.productName || product.product_name || '').toLowerCase();
      
      if (desc.includes('us') || desc.includes('united states') || desc.includes('america') ||
          name.includes('capital one') || name.includes('wells fargo') || name.includes('bank of america')) {
        byCountry['United States'].push(product);
      } else if (desc.includes('canada') || desc.includes('canadian') ||
                 name.includes('bmo') || name.includes('td bank') || name.includes('rbc')) {
        byCountry['Canada'].push(product);
      } else {
        byCountry['Other'].push(product);
      }
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
        // Extract info from description since it contains the structured data
        const desc = product.description || '';
        const typeMatch = desc.match(/^(\w+)/);
        const rateMatch = desc.match(/Rate: ([\d.%\s-]+)/);
        const termMatch = desc.match(/(\d+)-(\d+) months/);
        const docsMatch = desc.match(/Docs: (.+?)(?:\s*$)/);
        
        const productType = typeMatch ? typeMatch[1].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';
        const rates = rateMatch ? rateMatch[1] : 'Varies';
        const terms = termMatch ? `${termMatch[1]}-${termMatch[2]} months` : 'Varies';
        const docs = docsMatch ? docsMatch[1] : 'Not specified';
        
        const productName = product.productName || product.name || `${productType} Product`;
        
        console.log(`${index + 1}. **${productName} (${productType})**`);
        console.log(`   - Interest Rate: ${rates}`);
        console.log(`   - Terms: ${terms}`);
        console.log(`   - Required Documents: ${docs}`);
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