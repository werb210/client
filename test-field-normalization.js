/**
 * Test Field Normalization - Run this in browser console
 * Copy and paste this entire code block into your browser console
 */

(async function testFieldNormalization() {
  console.log('=== FIELD NORMALIZATION TEST ===');
  
  try {
    // Import idb-keyval dynamically
    const { get } = await import('https://unpkg.com/idb-keyval@6.2.1/dist/index.js');
    
    // Check both cache keys
    console.log('Checking cache keys...');
    
    let products = await get('lenderProducts');
    console.log('lenderProducts cache:', products ? products.length : 'not found');
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      products = await get('lender_products_cache');
      console.log('lender_products_cache:', products ? products.length : 'not found');
    }
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      console.log('❌ No products found in either cache');
      return;
    }
    
    console.log('✅ Found', products.length, 'products');
    
    // Check first product fields
    const sample = products[0];
    console.log('Sample product fields:', Object.keys(sample));
    
    // Test normalization function
    const normalizeProductFields = (product) => ({
      ...product,
      minAmount: product.minAmount ?? product.amountMin ?? product.min_amount ?? product.minAmountUsd ?? product.fundingMin ?? product.loanMin ?? null,
      maxAmount: product.maxAmount ?? product.amountMax ?? product.max_amount ?? product.maxAmountUsd ?? product.fundingMax ?? product.loanMax ?? null,
    });
    
    const normalized = normalizeProductFields(sample);
    
    console.log('Before normalization:', {
      minAmount: sample.minAmount,
      maxAmount: sample.maxAmount,
      amountMin: sample.amountMin,
      amountMax: sample.amountMax,
      minAmountUsd: sample.minAmountUsd,
      maxAmountUsd: sample.maxAmountUsd
    });
    
    console.log('After normalization:', {
      minAmount: normalized.minAmount,
      maxAmount: normalized.maxAmount
    });
    
    // Test all products
    const normalizedProducts = products.map(normalizeProductFields);
    const validProducts = normalizedProducts.filter(p => 
      p && 
      typeof p.minAmount === 'number' && 
      typeof p.maxAmount === 'number' && 
      !isNaN(p.minAmount) && 
      !isNaN(p.maxAmount) &&
      p.minAmount > 0 && 
      p.maxAmount > 0
    );
    
    console.log('Valid products after normalization:', validProducts.length);
    
    if (validProducts.length > 0) {
      const amounts = validProducts.map(p => ({ min: p.minAmount, max: p.maxAmount }));
      const minOverall = Math.min(...amounts.map(a => a.min));
      const maxOverall = Math.max(...amounts.map(a => a.max));
      
      console.log('✅ SUCCESS - Funding Range:', 
        '$' + minOverall.toLocaleString(), 
        'to', 
        '$' + maxOverall.toLocaleString()
      );
    } else {
      console.log('❌ No valid products found after normalization');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
})();