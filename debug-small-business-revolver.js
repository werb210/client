/**
 * Debug Small Business Revolver Product
 * Check if this product was recently updated and analyze its fields
 */

async function debugSmallBusinessRevolver() {
  console.log('🔍 DEBUGGING SMALL BUSINESS REVOLVER PRODUCT');
  
  try {
    // Get products from cache
    const products = JSON.parse(localStorage.getItem('lender-products-cache') || '[]');
    
    if (products.length === 0) {
      console.log('❌ No products in cache');
      return;
    }
    
    console.log(`📦 Found ${products.length} products in cache`);
    
    // Find Small Business Revolver products
    const revolverProducts = products.filter(p => 
      p.name?.toLowerCase().includes('revolver') ||
      p.product_name?.toLowerCase().includes('revolver') ||
      (p.name?.toLowerCase().includes('small') && p.name?.toLowerCase().includes('business'))
    );
    
    console.log(`\n🎯 Small Business Revolver products found: ${revolverProducts.length}`);
    
    revolverProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. Product Analysis:`);
      console.log(`   Name: ${product.name || product.product_name}`);
      console.log(`   Lender: ${product.lender_name}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Country: ${product.country}`);
      console.log(`   Min Amount: ${product.min_amount}`);
      console.log(`   Max Amount: ${product.max_amount}`);
      console.log(`   Created: ${product.created_at}`);
      console.log(`   Updated: ${product.updated_at}`);
      console.log(`   Doc Requirements:`, product.doc_requirements);
      console.log(`   Full Product:`, product);
    });
    
    // Check if it matches typical filtering criteria
    if (revolverProducts.length > 0) {
      const product = revolverProducts[0];
      
      console.log('\n🔬 FILTERING ANALYSIS:');
      console.log(`   Would match CA $100K capital request:`);
      console.log(`     Country match (CA): ${product.country === 'CA'}`);
      console.log(`     Amount range: $${product.min_amount || 0} - $${product.max_amount || 'unlimited'}`);
      console.log(`     Amount fit ($100K): ${(product.min_amount || 0) <= 100000 && 100000 <= (product.max_amount || Infinity)}`);
      console.log(`     Category: ${product.category}`);
      console.log(`     Is capital product: ${!product.category?.toLowerCase().includes('equipment')}`);
      
      // Check if it has document requirements
      const docs = product.doc_requirements || 
                   product.documentRequirements || 
                   product.requiredDocuments || 
                   product.required_documents || 
                   [];
      console.log(`     Has documents: ${docs.length > 0} (${docs.length} docs)`);
      if (docs.length > 0) {
        console.log(`     Documents: [${docs.join(', ')}]`);
      }
    }
    
  } catch (error) {
    console.error('Error analyzing Small Business Revolver:', error);
  }
}

// Run the analysis
debugSmallBusinessRevolver();