/**
 * Display All Products - Debug the exact structure
 */

async function displayAllProducts() {
  try {
    const response = await fetch('http://localhost:5000/api/public/lenders');
    const data = await response.json();
    
    if (data.success && data.products) {
      console.log(`📦 Found ${data.products.length} products`);
      
      // Show first 3 products with full structure
      console.log('\n🔍 Sample Product Structures:');
      data.products.slice(0, 3).forEach((product, index) => {
        console.log(`\n--- Product ${index + 1} ---`);
        console.log(JSON.stringify(product, null, 2));
      });
      
      // Look for Canadian products specifically
      console.log('\n🇨🇦 Looking for Canadian indicators...');
      data.products.forEach((product, index) => {
        const fields = [
          product.geography,
          product.country,
          product.region,
          product.location,
          product.market,
          product.territories
        ];
        
        const hasCanadianIndicator = fields.some(field => 
          field && field.toString().toLowerCase().includes('ca')
        );
        
        if (hasCanadianIndicator) {
          console.log(`✅ Product ${index + 1}: ${product.name}`);
          console.log(`   Fields: ${JSON.stringify(fields)}`);
        }
      });
      
      // Look for working capital indicators
      console.log('\n💼 Looking for working capital indicators...');
      data.products.forEach((product, index) => {
        const name = (product.name || '').toLowerCase();
        const category = (product.productCategory || product.category || product.type || '').toLowerCase();
        
        if (name.includes('working') || name.includes('capital') || 
            name.includes('line of credit') || category.includes('working') ||
            category.includes('capital') || category.includes('line')) {
          console.log(`💰 Product ${index + 1}: ${product.name}`);
          console.log(`   Category: ${product.productCategory || product.category || product.type}`);
          console.log(`   Name indicates: ${name.includes('working') ? 'working' : ''} ${name.includes('capital') ? 'capital' : ''} ${name.includes('line') ? 'line of credit' : ''}`);
        }
      });
      
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

displayAllProducts();