/**
 * Debug Working Capital Lender Products
 * Find the exact lenders that match Canadian working capital $40,000
 */

async function findWorkingCapitalLender() {
  console.log('🔍 Finding Working Capital Lenders');
  console.log('Criteria: Canada, $40,000, Working Capital');
  console.log('=' * 50);

  try {
    // Use the local server endpoint
    const response = await fetch('http://localhost:5000/api/public/lenders');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const response_data = await response.json();
    console.log('📦 API Response structure:', Object.keys(response_data));
    
    if (!response_data.success || !response_data.products) {
      console.log('❌ API response missing products:', response_data);
      return;
    }
    
    const products = response_data.products;
    console.log(`📦 Total products: ${products.length}`);

    // Apply filtering logic
    const matchingProducts = [];
    
    products.forEach((product, index) => {
      const geography = (product.geography || '').toString().toLowerCase();
      const hasCanada = geography.includes('ca') || geography.includes('canada');
      
      const minAmount = product.amountMin || 0;
      const maxAmount = product.amountMax || Infinity;
      const amountMatch = 40000 >= minAmount && 40000 <= maxAmount;
      
      const category = (product.productCategory || product.product || '').toLowerCase();
      const isWorkingCapital = category.includes('working') ||
                              category.includes('capital') ||
                              category.includes('line_of_credit') ||
                              category.includes('term_loan');
      
      const isInvoiceFactoring = category.includes('invoice') || category.includes('factoring');
      
      console.log(`\n${index + 1}. ${product.name || product.lender || 'Unknown'}`);
      console.log(`   Category: ${product.productCategory || product.product}`);
      console.log(`   Geography: ${geography} (Canada: ${hasCanada})`);
      console.log(`   Amount: $${minAmount?.toLocaleString()} - $${maxAmount?.toLocaleString()} (Match: ${amountMatch})`);
      console.log(`   Working Capital: ${isWorkingCapital}, Invoice Factoring: ${isInvoiceFactoring}`);
      
      if (hasCanada && amountMatch && isWorkingCapital && !isInvoiceFactoring) {
        console.log(`   ✅ MATCHES CRITERIA`);
        matchingProducts.push(product);
      } else {
        console.log(`   ❌ No match`);
      }
    });

    console.log('\n' + '=' * 50);
    console.log(`🎯 FINAL RESULTS: ${matchingProducts.length} matching products`);
    
    if (matchingProducts.length > 0) {
      console.log('\n🏛️ MATCHING LENDER PRODUCTS:');
      matchingProducts.forEach((product, index) => {
        console.log(`\n${index + 1}. LENDER: ${product.lender || product.name}`);
        console.log(`   PRODUCT: ${product.productCategory || product.product}`);
        console.log(`   AMOUNT RANGE: $${product.amountMin?.toLocaleString()} - $${product.amountMax?.toLocaleString()}`);
        console.log(`   INTEREST RATE: ${product.interestRateMin}% - ${product.interestRateMax}%`);
        console.log(`   TERMS: ${product.termMin} - ${product.termMax} months`);
        console.log(`   GEOGRAPHY: ${product.geography}`);
        if (product.description) {
          console.log(`   DESCRIPTION: ${product.description}`);
        }
      });
    }

  } catch (error) {
    console.error('🚨 Error:', error.message);
  }
}

// Run the function
findWorkingCapitalLender().catch(console.error);