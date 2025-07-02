import fetch from 'node-fetch';

async function debugCanadianProducts() {
  try {
    const response = await fetch('https://staffportal.replit.app/api/public/lenders');
    const data = await response.json();
    
    console.log('=== DEBUGGING CANADIAN $40K BUSINESS CAPITAL REQUEST ===\n');
    
    const targetAmount = 40000;
    const targetCountry = 'Canada';
    const lookingFor = 'capital'; // maps to working_capital
    const industry = 'manufacturing';
    
    // Filter Canadian products
    const canadianProducts = data.products.filter(p => p.country === 'Canada');
    console.log(`Total Canadian products: ${canadianProducts.length}`);
    
    // Check amount range compatibility
    const amountCompatible = canadianProducts.filter(p => 
      targetAmount >= p.amountRange.min && targetAmount <= p.amountRange.max
    );
    console.log(`Canadian products that fit $40K range: ${amountCompatible.length}`);
    
    // Check for working capital products
    const workingCapitalProducts = canadianProducts.filter(p => 
      p.category.toLowerCase().includes('working') || 
      p.category.toLowerCase().includes('capital') ||
      p.productName.toLowerCase().includes('working') ||
      p.productName.toLowerCase().includes('capital')
    );
    console.log(`Canadian working capital products: ${workingCapitalProducts.length}`);
    
    // Show all Canadian products with their details
    console.log('\n=== ALL CANADIAN PRODUCTS ===');
    canadianProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.productName}`);
      console.log(`   Lender: ${product.lenderName}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Amount Range: $${product.amountRange.min.toLocaleString()} - $${product.amountRange.max.toLocaleString()}`);
      console.log(`   Fits $40K? ${targetAmount >= product.amountRange.min && targetAmount <= product.amountRange.max ? 'YES' : 'NO'}`);
      console.log('');
    });
    
    // Check for products that should match the criteria
    const potentialMatches = canadianProducts.filter(p => {
      const fitsAmount = targetAmount >= p.amountRange.min && targetAmount <= p.amountRange.max;
      const isCapitalProduct = p.category.toLowerCase().includes('working') || 
                               p.category.toLowerCase().includes('capital') ||
                               p.category.toLowerCase().includes('term') ||
                               p.category.toLowerCase().includes('line') ||
                               p.productName.toLowerCase().includes('working') ||
                               p.productName.toLowerCase().includes('capital');
      return fitsAmount && isCapitalProduct;
    });
    
    console.log(`\n=== POTENTIAL MATCHES FOR $40K CANADIAN BUSINESS CAPITAL ===`);
    console.log(`Found ${potentialMatches.length} potential matches:`);
    potentialMatches.forEach((product, index) => {
      console.log(`${index + 1}. ${product.productName} by ${product.lenderName}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Range: $${product.amountRange.min.toLocaleString()} - $${product.amountRange.max.toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugCanadianProducts();