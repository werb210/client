/**
 * DEBUG API FIELD MAPPING
 * Analyze the exact field structure returned by the staff API
 */

async function debugAPIFieldMapping() {
  console.log('=== API FIELD MAPPING DEBUG ===');
  
  try {
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    console.log('API Response Structure:', {
      success: data.success,
      productCount: data.products?.length || 0,
      sampleProductFields: data.products?.[0] ? Object.keys(data.products[0]) : []
    });
    
    if (data.products && data.products.length > 0) {
      const firstProduct = data.products[0];
      console.log('=== FIRST PRODUCT FIELDS ===');
      console.log('Complete structure:', firstProduct);
      
      console.log('=== FIELD MAPPING ANALYSIS ===');
      console.log('Geographic field options:', {
        country: firstProduct.country,
        geography: firstProduct.geography,
        headquarters: firstProduct.headquarters,
        region: firstProduct.region
      });
      
      console.log('Amount field options:', {
        maxAmount: firstProduct.maxAmount,
        max_amount: firstProduct.max_amount,
        amountMax: firstProduct.amountMax,
        amount_max: firstProduct.amount_max,
        minAmount: firstProduct.minAmount,
        min_amount: firstProduct.min_amount
      });
      
      console.log('Category field options:', {
        category: firstProduct.category,
        productCategory: firstProduct.productCategory,
        product_category: firstProduct.product_category,
        type: firstProduct.type
      });
      
      console.log('=== SAMPLE PRODUCTS BY CATEGORY ===');
      const categorizedProducts = {};
      data.products.slice(0, 10).forEach(product => {
        const category = product.category || product.productCategory || 'Unknown';
        if (!categorizedProducts[category]) {
          categorizedProducts[category] = [];
        }
        categorizedProducts[category].push({
          name: product.name,
          geography: product.geography || product.country,
          maxAmount: product.maxAmount,
          minAmount: product.minAmount
        });
      });
      
      console.log('Products by category:', categorizedProducts);
    }
    
  } catch (error) {
    console.error('Debug error:', error);
  }
}

// Run the debug
debugAPIFieldMapping();