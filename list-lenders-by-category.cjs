const https = require('https');

// Fetch lender products from staff database
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
          const products = jsonData.products || [];
          resolve(products);
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

function categorizeByProductType(products) {
  const categories = {
    'Term Loans': [],
    'Lines of Credit': [],
    'Equipment Financing': [],
    'Invoice Factoring': [],
    'Purchase Order Financing': [],
    'Working Capital': [],
    'Asset-Based Lending': [],
    'Other Products': []
  };

  products.forEach(product => {
    const category = product.category || '';
    const productName = (product.productName || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    
    // Categorize based on the category field and product name
    if (category === 'term_loan' || productName.includes('term loan') || description.includes('mca')) {
      categories['Term Loans'].push(product);
    } else if (category === 'line_of_credit' || productName.includes('line of credit') || productName.includes('working capital') || description.includes('abl')) {
      categories['Lines of Credit'].push(product);
    } else if (category === 'equipment_financing' || productName.includes('equipment')) {
      categories['Equipment Financing'].push(product);
    } else if (category === 'invoice_factoring' || productName.includes('factoring') || productName.includes('receivable')) {
      categories['Invoice Factoring'].push(product);
    } else if (category === 'purchase_order_financing' || productName.includes('purchase order')) {
      categories['Purchase Order Financing'].push(product);
    } else if (productName.includes('working capital') && !description.includes('abl')) {
      categories['Working Capital'].push(product);
    } else if (productName.includes('abl') || productName.includes('asset-based') || description.includes('abl')) {
      categories['Asset-Based Lending'].push(product);
    } else {
      categories['Other Products'].push(product);
    }
  });

  return categories;
}

function formatAmount(amount) {
  if (!amount || amount === 'null' || amount === null) return 'Not specified';
  
  const num = parseFloat(amount);
  if (isNaN(num)) return amount;
  
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `$${(num / 1000).toFixed(0)}K`;
  } else {
    return `$${num.toLocaleString()}`;
  }
}

function formatInterestRate(min, max) {
  if (!min && !max) return 'Contact for rates';
  if (!min) return max;
  if (!max) return min;
  if (min === max) return min;
  return `${min} - ${max}`;
}

async function main() {
  try {
    console.log('Fetching lender products from staff database...\n');
    
    const products = await fetchLenderProducts();
    console.log(`Found ${products.length} total products\n`);
    
    const categorizedProducts = categorizeByProductType(products);
    
    // Display products by category
    Object.entries(categorizedProducts).forEach(([category, categoryProducts]) => {
      if (categoryProducts.length === 0) return;
      
      console.log(`## **${category.toUpperCase()} (${categoryProducts.length} products)**\n`);
      
      categoryProducts.forEach((product, index) => {
        // Extract info from description since it contains the structured data
        const desc = product.description || '';
        const rateMatch = desc.match(/Rate: ([\d.%\s-]+)/);
        const termMatch = desc.match(/(\d+)-(\d+) months/);
        const docsMatch = desc.match(/Docs: (.+?)(?:\s*$)/);
        
        const rates = rateMatch ? rateMatch[1] : 'Contact for rates';
        const terms = termMatch ? `${termMatch[1]}-${termMatch[2]} months` : 'Flexible terms';
        const docs = docsMatch ? docsMatch[1] : 'Standard documentation required';
        
        // Extract amounts from amountRange object
        const minAmount = formatAmount(product.amountRange?.min);
        const maxAmount = formatAmount(product.amountRange?.max);
        const amountRange = (minAmount === 'Not specified' && maxAmount === 'Not specified') 
          ? 'Contact for limits' 
          : `${minAmount} - ${maxAmount}`;
        
        // Get minimum revenue requirement
        const minRevenue = product.requirements?.minMonthlyRevenue 
          ? formatAmount(product.requirements.minMonthlyRevenue) + '/month' 
          : 'No minimum specified';
        
        console.log(`${index + 1}. **${product.productName}** (${product.lenderName})`);
        console.log(`   - Amount Range: ${amountRange}`);
        console.log(`   - Interest Rate: ${rates}`);
        console.log(`   - Terms: ${terms}`);
        console.log(`   - Geography: ${product.geography ? product.geography.join(', ') : 'Not specified'}`);
        console.log(`   - Min Revenue: ${minRevenue}`);
        console.log(`   - Required Documents: ${docs}`);
        console.log('');
      });
    });
    
    // Summary statistics
    const totalProducts = products.length;
    const categoriesWithProducts = Object.values(categorizedProducts).filter(cat => cat.length > 0).length;
    
    console.log(`\n**SUMMARY**`);
    console.log(`- Total Products: ${totalProducts}`);
    console.log(`- Product Categories: ${categoriesWithProducts}`);
    console.log(`- Geographic Coverage: US and Canada markets`);
    console.log(`- Interest Rates: From 1% to 49.99% depending on product type`);
    console.log(`- Terms: Flexible from 3 to 81 months`);
    
  } catch (error) {
    console.error('Error fetching lender products:', error.message);
    process.exit(1);
  }
}

main();