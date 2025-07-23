/**
 * Debug Working Capital Categorization Issue
 * Check why Step 2 shows only 1 Working Capital product when there should be 2
 */

async function debugWorkingCapitalCategorization() {
  console.log("🔍 DEBUGGING WORKING CAPITAL CATEGORIZATION");
  console.log("="*50);
  
  try {
    // 1. Fetch products
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    if (!data.success) {
      console.log("❌ API Error:", data);
      return;
    }
    
    const products = data.products;
    console.log(`📦 Total products: ${products.length}`);
    
    // 2. Find all Working Capital products
    const workingCapitalProducts = products.filter(p => p.category === 'Working Capital');
    console.log(`\n💼 Working Capital products in database: ${workingCapitalProducts.length}`);
    
    workingCapitalProducts.forEach((p, i) => {
      console.log(`${i+1}. ${p.name} (${p.lender_name})`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Country: ${p.country}`);
      console.log(`   Amount Range: $${(p.amount_min || 0).toLocaleString()} - $${(p.amount_max || 999999999).toLocaleString()}`);
      console.log(`   Category: "${p.category}"`);
      console.log("   ---");
    });
    
    // 3. Test filtering for Canada $40K scenario
    console.log("\n🇨🇦 Testing Canada $40K filtering...");
    
    const testData = {
      headquarters: 'CA',
      fundingAmount: 40000,
      lookingFor: 'capital',
      accountsReceivableBalance: 0,
      fundsPurpose: 'working capital'
    };
    
    console.log("Test form data:", testData);
    
    // Manual filter simulation
    const canadaFiltered = products.filter(p => {
      const isCanada = p.country === 'CA';
      const minAmount = p.amount_min || p.amountMin || 0;
      const maxAmount = p.amount_max || p.amountMax || 999999999;
      const inRange = minAmount <= 40000 && maxAmount >= 40000;
      
      if (p.category === 'Working Capital' && isCanada) {
        console.log(`\n✅ Working Capital Product: ${p.name}`);
        console.log(`   Range: $${minAmount.toLocaleString()} - $${maxAmount.toLocaleString()}`);
        console.log(`   In Range for $40K: ${inRange}`);
        console.log(`   Should Pass: ${isCanada && inRange}`);
      }
      
      return isCanada && inRange;
    });
    
    console.log(`\n📊 Products after Canada $40K filter: ${canadaFiltered.length}`);
    
    // 4. Group by category
    const categoryGroups = {};
    canadaFiltered.forEach(p => {
      if (!categoryGroups[p.category]) categoryGroups[p.category] = [];
      categoryGroups[p.category].push(p);
    });
    
    console.log("\n📋 Categories that should appear in Step 2:");
    Object.keys(categoryGroups).forEach(cat => {
      console.log(`   - ${cat}: ${categoryGroups[cat].length} products`);
      categoryGroups[cat].forEach(p => {
        console.log(`     * ${p.name} (${p.lender_name})`);
      });
    });
    
    // 5. Check for discrepancies
    const workingCapitalFiltered = categoryGroups['Working Capital'] || [];
    if (workingCapitalFiltered.length !== 2) {
      console.log(`\n❌ ISSUE FOUND: Expected 2 Working Capital products, got ${workingCapitalFiltered.length}`);
      
      // Check why Accord Access might not be appearing
      const accordProduct = products.find(p => p.name?.includes('Accord Access'));
      if (accordProduct) {
        console.log("\n🔍 Accord Access product details:");
        console.log("   Name:", accordProduct.name);
        console.log("   Category:", accordProduct.category);
        console.log("   Country:", accordProduct.country);
        console.log("   Amount Min:", accordProduct.amount_min);
        console.log("   Amount Max:", accordProduct.amount_max);
        console.log("   Passes filters:", 
          accordProduct.country === 'CA' && 
          (accordProduct.amount_min || 0) <= 40000 && 
          (accordProduct.amount_max || 999999999) >= 40000
        );
      } else {
        console.log("\n❌ Accord Access product not found in database!");
      }
    } else {
      console.log(`\n✅ Working Capital categorization looks correct: ${workingCapitalFiltered.length} products`);
    }
    
  } catch (error) {
    console.error("❌ Debug Error:", error);
  }
}

// Execute debug
debugWorkingCapitalCategorization();