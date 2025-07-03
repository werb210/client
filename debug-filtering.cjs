// Debug exact filtering logic for Canadian $50K business capital
async function debugFiltering() {
  try {
    const { default: fetch } = await import('node-fetch');
    
    console.log('Fetching products from staff API...');
    const response = await fetch('https://staffportal.replit.app/api/public/lenders');
    const data = await response.json();
    
    if (!data.products) {
      console.error('No products found in API response');
      return;
    }
    
    // Test filtering parameters
    const testParams = {
      businessLocation: "canada",
      fundingAmount: "$50000",
      lookingFor: "capital",
      industry: "manufacturing"
    };
    
    console.log('\n=== TEST FILTERING PARAMETERS ===');
    console.log('Business Location:', testParams.businessLocation);
    console.log('Funding Amount:', testParams.fundingAmount);
    console.log('Looking For:', testParams.lookingFor);
    console.log('Industry:', testParams.industry);
    
    // Parse funding amount
    const fundingAmount = parseFloat(testParams.fundingAmount.replace(/[^0-9.-]+/g, ''));
    const headquarters = testParams.businessLocation === "united-states" ? "United States" : "Canada";
    const selectedCountryCode = headquarters === "United States" ? "US" : "CA";
    
    console.log('\n=== PARSED VALUES ===');
    console.log('Headquarters:', headquarters);
    console.log('Selected Country Code:', selectedCountryCode);
    console.log('Parsed Funding Amount:', fundingAmount);
    
    // Business capital product categories
    function isBusinessCapitalProduct(category) {
      const capitalCategories = [
        'Working Capital',
        'Business Line of Credit', 
        'Term Loan',
        'Business Term Loan',
        'SBA Loan',
        'Asset Based Lending',
        'Invoice Factoring',
        'Purchase Order Financing'
      ];
      
      return capitalCategories.some(cat => 
        category.toLowerCase().includes(cat.toLowerCase()) ||
        cat.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    // Apply filtering step by step
    console.log('\n=== STEP BY STEP FILTERING ===');
    console.log(`Starting with ${data.products.length} total products`);
    
    // Step 1: Country filter
    const countryFiltered = data.products.filter(p => {
      const matches = (p.country === selectedCountryCode || p.country === 'US/CA');
      if (!matches) {
        console.log(`❌ Country: ${p.productName} (${p.country}) doesn't match ${selectedCountryCode}`);
      }
      return matches;
    });
    console.log(`After country filter: ${countryFiltered.length} products`);
    
    // Step 2: Amount range filter
    const amountFiltered = countryFiltered.filter(p => {
      const min = p.amountRange?.min || 0;
      const max = p.amountRange?.max || Infinity;
      const matches = (fundingAmount >= min && fundingAmount <= max);
      if (!matches) {
        console.log(`❌ Amount: ${p.productName} range $${min}-$${max} doesn't fit $${fundingAmount}`);
      }
      return matches;
    });
    console.log(`After amount filter: ${amountFiltered.length} products`);
    
    // Step 3: Business capital type filter
    const typeFiltered = amountFiltered.filter(p => {
      if (testParams.lookingFor === "capital") {
        const matches = isBusinessCapitalProduct(p.category);
        if (!matches) {
          console.log(`❌ Product Type: ${p.productName} (${p.category}) doesn't match capital requirement`);
        }
        return matches;
      }
      return true;
    });
    console.log(`After business capital filter: ${typeFiltered.length} products`);
    
    // Show successful matches
    console.log('\n=== SUCCESSFUL MATCHES ===');
    typeFiltered.forEach((p, index) => {
      const min = p.amountRange?.min || 0;
      const max = p.amountRange?.max || Infinity;
      console.log(`${index + 1}. ${p.productName} - ${p.lenderName}`);
      console.log(`   Country: ${p.country}, Category: ${p.category}`);
      console.log(`   Range: $${min} - $${max}`);
    });
    
    // Check if there are any Canadian products that should match
    console.log('\n=== CANADIAN BUSINESS CAPITAL PRODUCTS ANALYSIS ===');
    const canadianProducts = data.products.filter(p => p.country === 'CA');
    const canadianCapitalProducts = canadianProducts.filter(p => isBusinessCapitalProduct(p.category));
    
    console.log(`Total Canadian products: ${canadianProducts.length}`);
    console.log(`Canadian business capital products: ${canadianCapitalProducts.length}`);
    
    canadianCapitalProducts.forEach((p, index) => {
      const min = p.amountRange?.min || 0;
      const max = p.amountRange?.max || Infinity;
      const inRange = (fundingAmount >= min && fundingAmount <= max);
      console.log(`${index + 1}. ${p.productName} - ${p.lenderName}`);
      console.log(`   Category: ${p.category}`);
      console.log(`   Range: $${min} - $${max} (${inRange ? '✅ IN RANGE' : '❌ OUT OF RANGE'} for $${fundingAmount})`);
    });
    
  } catch (error) {
    console.error('Error debugging filtering:', error.message);
  }
}

debugFiltering();