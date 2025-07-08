/**
 * Debug AccordAccess Product Details
 * Check the exact structure and category of the AccordAccess product
 */

async function debugAccordAccessProduct() {
  console.log('🔍 Debugging AccordAccess Product Details\n');
  
  try {
    // Fetch products from correct API
    const response = await fetch('https://staff.boreal.financial/api/public/lenders');
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success || !data.products) {
      throw new Error('Invalid API response');
    }
    
    const allLenders = data.products;
    console.log(`📦 Found ${allLenders.length} total products\n`);
    
    // Find AccordAccess specifically
    const accordProducts = allLenders.filter(product => 
      product.lenderName?.toLowerCase().includes('accord') || 
      product.name?.toLowerCase().includes('accord')
    );
    
    console.log(`🎯 Found ${accordProducts.length} Accord Financial products:`);
    accordProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name} (${product.lenderName})`);
      console.log(`   Category: "${product.category}"`);
      console.log(`   Country: "${product.country}"`);
      console.log(`   Amount: ${product.amountMin}-${product.amountMax}`);
      console.log(`   Documents: ${product.requiredDocuments?.join(', ') || 'None'}`);
      console.log(`   Full product:`, product);
    });
    
    // Check all available categories
    const allCategories = [...new Set(allLenders.map(p => p.category))];
    console.log(`\n📋 All available categories in database:`);
    allCategories.forEach(cat => console.log(`   "${cat}"`));
    
    // Check products for Canadian market
    const canadianProducts = allLenders.filter(p => p.country === 'CA');
    console.log(`\n🇨🇦 Found ${canadianProducts.length} Canadian products:`);
    canadianProducts.forEach(product => {
      console.log(`   ${product.name} (${product.lenderName}) - Category: "${product.category}"`);
    });
    
    // Check for products that contain "working" or "capital" in name or category
    const workingCapitalProducts = allLenders.filter(product => 
      product.category?.toLowerCase().includes('working') ||
      product.category?.toLowerCase().includes('capital') ||
      product.name?.toLowerCase().includes('working') ||
      product.name?.toLowerCase().includes('capital')
    );
    
    console.log(`\n💼 Products with "working" or "capital":`);
    workingCapitalProducts.forEach(product => {
      console.log(`   ${product.name} (${product.lenderName})`);
      console.log(`     Category: "${product.category}"`);
      console.log(`     Country: "${product.country}"`);
      console.log(`     Amount: ${product.amountMin}-${product.amountMax}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the debug
debugAccordAccessProduct();