// Test script to search for Advance Funds Network products in lender database
console.log('🔍 Searching for Advance Funds Network products...');

// Function to search products
async function searchAdvanceFundsNetwork() {
  try {
    // Fetch all lender products
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    console.log('📊 Total products in database:', data.length);
    
    // Search for Advance Funds Network products
    const advanceFundsProducts = data.filter(product => 
      product.lender_name?.toLowerCase().includes('advance funds') ||
      product.lender_name?.toLowerCase().includes('advance fund') ||
      product.name?.toLowerCase().includes('advance funds') ||
      product.name?.toLowerCase().includes('advance fund')
    );
    
    console.log('🎯 Advance Funds Network products found:', advanceFundsProducts.length);
    
    if (advanceFundsProducts.length > 0) {
      console.log('📋 Advance Funds Network Products:');
      advanceFundsProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.lender_name})`);
        console.log(`   Category: ${product.category}`);
        console.log(`   Country: ${product.country}`);
        console.log(`   Amount: $${product.min_amount?.toLocaleString()} - $${product.max_amount?.toLocaleString()}`);
        console.log(`   Active: ${product.is_active}`);
        console.log(`   Requirements: ${product.doc_requirements?.join(', ')}`);
        console.log('---');
      });
    }
    
    // Check specifically for working capital products
    const workingCapitalProducts = data.filter(product => 
      (product.category?.toLowerCase().includes('working capital') ||
       product.product_type?.toLowerCase().includes('working_capital') ||
       product.name?.toLowerCase().includes('working capital')) &&
      product.country === 'CA' &&
      product.min_amount <= 40000 &&
      product.max_amount >= 40000
    );
    
    console.log('💼 All Canadian Working Capital products for $40,000:');
    workingCapitalProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.lender_name})`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Amount: $${product.min_amount?.toLocaleString()} - $${product.max_amount?.toLocaleString()}`);
      console.log(`   Active: ${product.is_active}`);
      console.log('---');
    });
    
    // Search all lenders for any containing "advance"
    const allAdvanceProducts = data.filter(product => 
      product.lender_name?.toLowerCase().includes('advance') ||
      product.name?.toLowerCase().includes('advance')
    );
    
    console.log('🔍 All products containing "advance":', allAdvanceProducts.length);
    allAdvanceProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.lender_name})`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Country: ${product.country}`);
      console.log(`   Active: ${product.is_active}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Error searching products:', error);
  }
}

// Run the search
searchAdvanceFundsNetwork();