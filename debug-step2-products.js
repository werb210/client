/**
 * Debug Step 2 Product Filtering Issue
 * Test various scenarios to identify why products aren't showing
 */

async function debugStep2Products() {
  console.log("🔍 DEBUGGING STEP 2 PRODUCT FILTERING");
  console.log("=" * 50);
  
  try {
    // 1. Test API Endpoint
    console.log("1. Testing API endpoint...");
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    if (!data.success) {
      console.log("❌ API Response Error:", data);
      return;
    }
    
    console.log(`✅ API Success: ${data.products.length} products fetched`);
    
    // 2. Test with Working Capital scenario (Canada $40,000)
    console.log("\n2. Testing Canada $40,000 Working Capital filtering...");
    
    const testFormData = {
      headquarters: 'CA',
      fundingAmount: 40000,
      lookingFor: 'capital',
      accountsReceivableBalance: 0,
      fundsPurpose: 'working capital'
    };
    
    console.log("Test form data:", testFormData);
    
    // Manual filtering to identify issues
    const products = data.products;
    
    // Country filter
    const countryFiltered = products.filter(p => p.country === 'CA');
    console.log(`   After country filter (CA): ${countryFiltered.length} products`);
    
    // Amount filter
    const amountFiltered = countryFiltered.filter(p => {
      const min = p.amount_min || p.amountMin || 0;
      const max = p.amount_max || p.amountMax || 999999999;
      return min <= 40000 && max >= 40000;
    });
    console.log(`   After amount filter ($40K): ${amountFiltered.length} products`);
    
    // Show matching products
    if (amountFiltered.length > 0) {
      console.log("\n✅ Matching products found:");
      amountFiltered.forEach((p, i) => {
        console.log(`   ${i+1}. ${p.name} (${p.lender_name})`);
        console.log(`      Category: ${p.category}`);
        console.log(`      Range: $${(p.amount_min || 0).toLocaleString()} - $${(p.amount_max || 999999999).toLocaleString()}`);
      });
      
      // Group by category
      const categories = {};
      amountFiltered.forEach(p => {
        if (!categories[p.category]) categories[p.category] = [];
        categories[p.category].push(p);
      });
      
      console.log("\n📋 Categories that should appear in Step 2:");
      Object.keys(categories).forEach(cat => {
        console.log(`   - ${cat}: ${categories[cat].length} products`);
      });
      
    } else {
      console.log("❌ No products match the filters - this is the issue!");
      
      // Debug why no matches
      console.log("\nDebugging why no matches...");
      console.log("Sample product structure:");
      console.log(products[0]);
    }
    
    // 3. Test with different scenarios
    console.log("\n3. Testing other common scenarios...");
    
    const scenarios = [
      { name: "US $25K Equipment", data: { headquarters: 'US', fundingAmount: 25000, lookingFor: 'equipment' }},
      { name: "CA $100K Working Capital", data: { headquarters: 'CA', fundingAmount: 100000, lookingFor: 'capital' }},
      { name: "US $50K Both", data: { headquarters: 'US', fundingAmount: 50000, lookingFor: 'both' }}
    ];
    
    scenarios.forEach(scenario => {
      const filtered = products.filter(p => {
        const countryMatch = p.country === scenario.data.headquarters;
        const min = p.amount_min || p.amountMin || 0;
        const max = p.amount_max || p.amountMax || 999999999;
        const amountMatch = min <= scenario.data.fundingAmount && max >= scenario.data.fundingAmount;
        return countryMatch && amountMatch;
      });
      
      console.log(`   ${scenario.name}: ${filtered.length} products`);
    });
    
  } catch (error) {
    console.error("❌ Debug Error:", error);
  }
}

// Execute the debug
debugStep2Products();