// Debug frontend product categories
console.log('🔍 Debugging frontend product categorization...');

fetch('/api/public/lenders')
  .then(response => response.json())
  .then(products => {
    console.log('📊 Total products from frontend API:', products.length);
    
    // Find Accord products
    const accordProducts = products.filter(p => 
      p.lender_name?.toLowerCase().includes('accord') ||
      p.name?.toLowerCase().includes('accord')
    );
    
    console.log('🏦 Accord products from frontend API:');
    accordProducts.forEach(p => {
      console.log(`- ${p.name} (${p.lender_name})`);
      console.log(`  Category: "${p.category}"`);
      console.log(`  Product Type: "${p.product_type}"`);
      console.log(`  Country: ${p.country}`);
      console.log(`  Amount: $${p.min_amount?.toLocaleString()} - $${p.max_amount?.toLocaleString()}`);
      console.log('---');
    });
    
    // Check Working Capital vs Business Line of Credit categorization
    const workingCapitalProducts = products.filter(p => 
      p.category === 'Working Capital' &&
      p.country === 'CA' &&
      p.min_amount <= 40000 &&
      p.max_amount >= 40000
    );
    
    const businessLineProducts = products.filter(p => 
      p.category === 'Business Line of Credit' &&
      p.country === 'CA' &&
      p.min_amount <= 40000 &&
      p.max_amount >= 40000
    );
    
    console.log('💼 Working Capital products (CA, $40k):');
    workingCapitalProducts.forEach(p => {
      console.log(`- ${p.name} (${p.lender_name})`);
    });
    
    console.log('💳 Business Line of Credit products (CA, $40k):');
    businessLineProducts.forEach(p => {
      console.log(`- ${p.name} (${p.lender_name})`);
    });
    
    // Specifically check Accord Access
    const accordAccess = products.find(p => 
      p.name?.toLowerCase() === 'accord access'
    );
    
    if (accordAccess) {
      console.log('✅ Accord Access details:');
      console.log('Name:', accordAccess.name);
      console.log('Category:', accordAccess.category);
      console.log('Lender:', accordAccess.lender_name);
      console.log('Should be Working Capital:', accordAccess.category === 'Working Capital');
    } else {
      console.log('❌ Accord Access not found in frontend API');
    }
  })
  .catch(error => {
    console.error('❌ Error fetching products:', error);
  });