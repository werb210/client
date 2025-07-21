/**
 * Quick Product Validation Test Script
 * Run this in browser console at /product-validation-test page
 */

// Test the validation system
async function runQuickValidation() {
  console.log('🔍 Starting Product Compatibility Validation...');
  
  try {
    // Fetch products directly from API
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    const products = data.success ? data.products : data;
    
    console.log(`📊 Found ${products.length} products to validate`);
    
    // Quick sample validation of first 5 products
    const sampleProducts = products.slice(0, 5);
    
    sampleProducts.forEach((product, index) => {
      console.log(`\n--- Product ${index + 1}: ${product.name} ---`);
      console.log(`Lender: ${product.lender_name || product.lenderName || 'Unknown'}`);
      console.log(`Category: ${product.category || 'None'}`);
      console.log(`Country: ${product.country || 'None'}`);
      
      // Check amount fields
      const hasAmounts = !!(
        product.minAmount || product.maxAmount || product.amountMin || product.amountMax ||
        product.amount_min || product.amount_max || product.min_amount || product.max_amount
      );
      console.log(`Amount fields: ${hasAmounts ? '✅' : '❌'}`);
      
      // Check document fields
      const hasDocuments = !!(
        product.requiredDocuments || product.document_requirements || 
        product.doc_requirements || product.documentRequirements || product.required_documents
      );
      console.log(`Document fields: ${hasDocuments ? '✅' : '❌'}`);
      
      // Check category validity
      const categoryValid = product.category && 
        ['factoring', 'equipment', 'term loan', 'line of credit', 'working capital', 'purchase order', 'asset based', 'sba']
        .some(cat => product.category.toLowerCase().includes(cat.toLowerCase()));
      console.log(`Category valid: ${categoryValid ? '✅' : '❌'}`);
    });
    
    // Overall statistics
    const withAmountFields = products.filter(p => !!(
      p.minAmount || p.maxAmount || p.amountMin || p.amountMax ||
      p.amount_min || p.amount_max || p.min_amount || p.max_amount
    )).length;
    
    const withDocumentFields = products.filter(p => !!(
      p.requiredDocuments || p.document_requirements || 
      p.doc_requirements || p.documentRequirements || p.required_documents
    )).length;
    
    const withValidCategories = products.filter(p => p.category && 
      ['factoring', 'equipment', 'term loan', 'line of credit', 'working capital', 'purchase order', 'asset based', 'sba']
      .some(cat => p.category.toLowerCase().includes(cat.toLowerCase()))).length;
    
    console.log(`\n📈 VALIDATION SUMMARY:`);
    console.log(`Total Products: ${products.length}`);
    console.log(`With Amount Fields: ${withAmountFields}/${products.length} (${Math.round(withAmountFields/products.length*100)}%)`);
    console.log(`With Document Fields: ${withDocumentFields}/${products.length} (${Math.round(withDocumentFields/products.length*100)}%)`);
    console.log(`With Valid Categories: ${withValidCategories}/${products.length} (${Math.round(withValidCategories/products.length*100)}%)`);
    
    // Country analysis
    const countries = [...new Set(products.map(p => p.country))];
    console.log(`\n🌍 Countries: ${countries.join(', ')}`);
    
    // Category analysis
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    console.log(`\n📂 Categories: ${categories.join(', ')}`);
    
    return {
      totalProducts: products.length,
      withAmountFields,
      withDocumentFields,
      withValidCategories,
      countries,
      categories
    };
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    return null;
  }
}

// Run the validation
runQuickValidation();