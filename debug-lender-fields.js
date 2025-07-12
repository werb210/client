/**
 * Debug Lender Product Fields - Check for problematic field structures
 */

async function debugLenderFields() {
  try {
    console.log('=== LENDER PRODUCT FIELD ANALYSIS ===');
    
    // Check IndexedDB cache first
    const request = indexedDB.open('lender-cache', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['products'], 'readonly');
      const store = transaction.objectStore('products');
      const getRequest = store.get('products');
      
      getRequest.onsuccess = () => {
        const cached = getRequest.result;
        if (cached && cached.data) {
          const products = cached.data;
          console.log(`Found ${products.length} products in cache`);
          
          if (products.length > 0) {
            const sample = products[0];
            console.log('Sample product structure:', sample);
            
            // Check for problematic fields
            const fieldAnalysis = {
              hasMinAmount: !!sample.minAmount,
              hasMaxAmount: !!sample.maxAmount,
              hasCountry: !!sample.country,
              hasCategory: !!sample.category,
              hasName: !!sample.name,
              hasInterestRate: !!sample.interestRate,
              hasTerms: !!sample.terms,
              minAmountType: typeof sample.minAmount,
              maxAmountType: typeof sample.maxAmount,
              minAmountValue: sample.minAmount,
              maxAmountValue: sample.maxAmount,
              allFields: Object.keys(sample)
            };
            
            console.log('Field Analysis:', fieldAnalysis);
            
            // Check for NaN, null, undefined in amount fields
            const amountIssues = products.map((p, index) => ({
              index,
              name: p.name,
              minAmount: p.minAmount,
              maxAmount: p.maxAmount,
              minAmountIsNaN: isNaN(p.minAmount),
              maxAmountIsNaN: isNaN(p.maxAmount),
              minAmountIsNull: p.minAmount === null,
              maxAmountIsNull: p.maxAmount === null
            })).filter(p => 
              p.minAmountIsNaN || p.maxAmountIsNaN || 
              p.minAmountIsNull || p.maxAmountIsNull ||
              !p.minAmount || !p.maxAmount
            );
            
            console.log('Products with amount issues:', amountIssues);
            
            // Test funding range calculation
            try {
              const validProducts = products.filter(p => p.minAmount && p.maxAmount && !isNaN(p.minAmount) && !isNaN(p.maxAmount));
              console.log(`Valid products for range calculation: ${validProducts.length}/${products.length}`);
              
              if (validProducts.length > 0) {
                const minFunding = Math.min(...validProducts.map(p => p.minAmount));
                const maxFunding = Math.max(...validProducts.map(p => p.maxAmount));
                console.log(`Funding Range: $${minFunding.toLocaleString()} - $${maxFunding.toLocaleString()}`);
              } else {
                console.log('No valid products for funding range calculation');
              }
            } catch (error) {
              console.log('Error calculating funding range:', error.message);
            }
            
            // Check countries
            const countries = Array.from(new Set(products.map(p => p.country).filter(Boolean)));
            console.log('Available countries:', countries);
            
          } else {
            console.log('No products in cache');
          }
        } else {
          console.log('No cache data found');
        }
      };
      
      getRequest.onerror = () => {
        console.log('Error reading from cache');
      };
    };
    
    request.onerror = () => {
      console.log('Error opening IndexedDB');
    };
    
  } catch (error) {
    console.log('Debug error:', error.message);
  }
}

// Run the debug
debugLenderFields();