/**
 * Debug Exact Field Structure
 * Run this in browser console to see exact field names in cached products
 */

async function debugExactFields() {
  console.log('=== EXAMINING EXACT FIELD STRUCTURE ===');
  
  try {
    const request = indexedDB.open('lender-cache', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['products'], 'readonly');
      const store = transaction.objectStore('products');
      const getRequest = store.get('products');
      
      getRequest.onsuccess = () => {
        const cached = getRequest.result;
        if (cached && cached.data && cached.data.length > 0) {
          const products = cached.data;
          console.log(`Found ${products.length} products in cache`);
          
          // Examine first 3 products in detail
          products.slice(0, 3).forEach((product, index) => {
            console.log(`\n=== PRODUCT ${index + 1} ===`);
            console.log('Product name:', product.name || product.productName);
            console.log('All fields:', Object.keys(product));
            
            // Check every possible amount field variation
            const amountFields = {
              'minAmount': product.minAmount,
              'maxAmount': product.maxAmount,
              'amountMin': product.amountMin,
              'amountMax': product.amountMax,
              'minAmountUsd': product.minAmountUsd,
              'maxAmountUsd': product.maxAmountUsd,
              'amount_min': product.amount_min,
              'amount_max': product.amount_max,
              'min_amount': product.min_amount,
              'max_amount': product.max_amount,
              'fundingMin': product.fundingMin,
              'fundingMax': product.fundingMax,
              'loanMin': product.loanMin,
              'loanMax': product.loanMax
            };
            
            console.log('Amount field check:', amountFields);
            
            // Check for any numeric fields that might be amounts
            const numericFields = Object.keys(product).filter(key => 
              typeof product[key] === 'number' && product[key] > 1000
            );
            console.log('Numeric fields > 1000:', numericFields.map(k => `${k}: ${product[k]}`));
            
            // Check for string fields that might be amounts
            const stringFields = Object.keys(product).filter(key => 
              typeof product[key] === 'string' && /\d{4,}/.test(product[key])
            );
            console.log('String fields with numbers:', stringFields.map(k => `${k}: ${product[k]}`));
          });
          
          // Field frequency analysis
          console.log('\n=== FIELD FREQUENCY ANALYSIS ===');
          const allFields = {};
          products.forEach(p => {
            Object.keys(p).forEach(key => {
              allFields[key] = (allFields[key] || 0) + 1;
            });
          });
          
          const sortedFields = Object.entries(allFields)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 20);
          
          console.log('Top 20 most common fields:');
          sortedFields.forEach(([field, count]) => {
            console.log(`  ${field}: ${count}/${products.length} products`);
          });
          
        } else {
          console.log('No cache data found');
        }
      };
    };
    
    request.onerror = () => {
      console.log('Error accessing IndexedDB');
    };
    
  } catch (error) {
    console.log('Script error:', error.message);
  }
}

debugExactFields();