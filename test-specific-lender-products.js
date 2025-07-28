/**
 * Test Specific Lender Products for Canadian Working Capital $40,000
 * Shows the actual lender names and product details that match the criteria
 * 
 * SECURITY: Uses environment variable for authentication token
 */

const API_BASE_URL = 'https://staff.boreal.financial/api';
const BEARER_TOKEN = process.env.CLIENT_APP_SHARED_TOKEN || 'YOUR_TOKEN_HERE';

async function testSpecificLenderProducts() {
  console.log('🇨🇦 Testing Specific Lender Products');
  console.log('Criteria: Canadian working capital, $40,000');
  console.log('=' * 60);

  try {
    // Fetch all lender products
    const response = await fetch(`${API_BASE_URL}/public/lenders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`API Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const products = await response.json();
      console.log(`📦 Total products in database: ${products.length}`);

      // Apply the exact filtering logic used in the application
      const filteredProducts = products.filter(product => {
        // 1. Geography filter - must include Canada
        const geography = product.geography || '';
        const hasCanada = geography.toLowerCase().includes('ca') || 
                         geography.toLowerCase().includes('canada');
        
        // 2. Amount filter - $40,000 must be within range
        const minAmount = product.amountMin || 0;
        const maxAmount = product.amountMax || Infinity;
        const amountMatch = 40000 >= minAmount && 40000 <= maxAmount;
        
        // 3. Product type filter - working capital related
        const productType = (product.productCategory || product.product || '').toLowerCase();
        const isWorkingCapital = productType.includes('working') ||
                                productType.includes('capital') ||
                                productType.includes('line_of_credit') ||
                                productType.includes('term_loan');
        
        // 4. Exclude invoice factoring since no AR balance
        const isInvoiceFactoring = productType.includes('invoice') || 
                                  productType.includes('factoring');
        
        const matches = hasCanada && amountMatch && isWorkingCapital && !isInvoiceFactoring;
        
        if (matches) {
          console.log(`✅ MATCH: ${product.name || product.lender}`);
          console.log(`   Category: ${product.productCategory || product.product}`);
          console.log(`   Amount: $${minAmount?.toLocaleString()} - $${maxAmount?.toLocaleString()}`);
          console.log(`   Geography: ${geography}`);
          console.log(`   Interest Rate: ${product.interestRateMin}% - ${product.interestRateMax}%`);
          console.log(`   Terms: ${product.termMin} - ${product.termMax} months`);
          if (product.description) {
            console.log(`   Description: ${product.description}`);
          }
          console.log('');
        }
        
        return matches;
      });

      console.log(`🎯 RESULTS: ${filteredProducts.length} products match Canadian working capital $40,000`);
      
      if (filteredProducts.length > 0) {
        console.log('\n📊 Summary of Matching Products:');
        filteredProducts.forEach((product, index) => {
          console.log(`${index + 1}. ${product.name || product.lender}`);
          console.log(`   Type: ${product.productCategory || product.product}`);
          console.log(`   Rate: ${product.interestRateMin}% - ${product.interestRateMax}%`);
          console.log(`   Terms: ${product.termMin} - ${product.termMax} months`);
        });

        // Group by lender
        const byLender = filteredProducts.reduce((acc, product) => {
          const lender = product.lender || product.name || 'Unknown';
          if (!acc[lender]) acc[lender] = [];
          acc[lender].push(product);
          return acc;
        }, {});

        console.log('\n🏛️ Products by Lender:');
        Object.entries(byLender).forEach(([lender, products]) => {
          console.log(`${lender}: ${products.length} product(s)`);
          products.forEach(product => {
            console.log(`  • ${product.productCategory || product.product}`);
          });
        });
      }

    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', errorText);
    }

  } catch (error) {
    console.error('🚨 Test Error:', error.message);
  }

  console.log('\n' + '=' * 60);
  console.log('🎯 Specific Lender Products Test Complete');
}

// Run the test
testSpecificLenderProducts().catch(console.error);