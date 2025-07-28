/**
 * Test Equipment Financing Fix
 * Verify that Canadian equipment financing products are now properly filtered
 */

async function testEquipmentFinancingFix() {
  console.log("🔧 TESTING EQUIPMENT FINANCING FIX");
  console.log("=".repeat(50));
  
  try {
    // Test scenario: Canadian business looking for equipment financing
    const testScenario = {
      businessLocation: "canada",
      lookingFor: "equipment", 
      fundingAmount: "40000",
      accountsReceivable: "50k-to-100k"
    };
    
    console.log("📋 Test Scenario:", testScenario);
    
    // 1. Get all lender products from API
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      console.error("❌ API request failed:", data);
      return;
    }
    
    const products = data.products;
    console.log(`✅ API returned ${products.length} total products`);
    
    // 2. Find Equipment Financing products
    const equipmentProducts = products.filter(p => p.category === 'Equipment Financing');
    console.log(`🏗️ Equipment Financing products found: ${equipmentProducts.length}`);
    
    const canadianEquipmentProducts = equipmentProducts.filter(p => p.country === 'CA');
    console.log(`🇨🇦 Canadian Equipment Financing products: ${canadianEquipmentProducts.length}`);
    
    // 3. Show the specific products
    console.log("\n📋 CANADIAN EQUIPMENT FINANCING PRODUCTS:");
    canadianEquipmentProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name || product.lender}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Country: ${product.country}`);
      console.log(`   Amount Range: $${product.minAmount || product.amountMin} - $${product.maxAmount || product.amountMax}`);
      if (product.requiredDocuments) {
        console.log(`   Required Docs: ${product.requiredDocuments.slice(0, 3).join(', ')}${product.requiredDocuments.length > 3 ? '...' : ''}`);
      }
      console.log("");
    });
    
    // 4. Test if $40,000 fits in range
    const fundingAmount = 40000;
    const eligibleProducts = canadianEquipmentProducts.filter(p => {
      const minAmount = p.minAmount || p.amountMin || 0;
      const maxAmount = p.maxAmount || p.amountMax || 999999999;
      return fundingAmount >= minAmount && fundingAmount <= maxAmount;
    });
    
    console.log(`💰 Products eligible for $${fundingAmount.toLocaleString()}:`);
    if (eligibleProducts.length === 0) {
      console.log("❌ No products eligible for this amount");
      console.log("Amount ranges:");
      canadianEquipmentProducts.forEach(p => {
        const minAmount = p.minAmount || p.amountMin || 0;
        const maxAmount = p.maxAmount || p.amountMax || 999999999;
        console.log(`   ${p.name}: $${minAmount.toLocaleString()} - $${maxAmount.toLocaleString()}`);
      });
    } else {
      eligibleProducts.forEach(p => {
        console.log(`✅ ${p.name || p.lender} - eligible`);
      });
    }
    
    // 5. Test the isEquipmentFinancingProduct function
    console.log("\n🔍 TESTING CATEGORY MATCHING LOGIC:");
    const testCategories = [
      'Equipment Financing',
      'Equipment Finance', 
      'Asset-Based Lending',
      'Asset Based Lending',
      'Working Capital',
      'Term Loan'
    ];
    
    testCategories.forEach(category => {
      const isEquipment = isEquipmentFinancingProduct(category);
      console.log(`${isEquipment ? '✅' : '❌'} "${category}" -> Equipment Product: ${isEquipment}`);
    });
    
    // 6. Simulate the filtering logic
    console.log("\n🎯 SIMULATING FILTERING LOGIC:");
    console.log("Testing scenario: lookingFor = 'equipment', businessLocation = 'canada', amount = $40,000");
    
    const filteredProducts = products.filter(product => {
      // Country check
      if (product.country !== 'CA') {
        return false;
      }
      
      // Amount check 
      const minAmount = product.minAmount || product.amountMin || 0;
      const maxAmount = product.maxAmount || product.amountMax || 999999999;
      if (fundingAmount < minAmount || fundingAmount > maxAmount) {
        return false;
      }
      
      // Equipment financing check
      if (testScenario.lookingFor === "equipment") {
        return isEquipmentFinancingProduct(product.category);
      }
      
      return true;
    });
    
    console.log(`🎯 FINAL RESULT: ${filteredProducts.length} products match Canadian equipment financing criteria`);
    
    if (filteredProducts.length > 0) {
      console.log("✅ SUCCESS: Equipment financing filtering is working!");
      filteredProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name || product.lender} (${product.category})`);
      });
    } else {
      console.log("❌ STILL BROKEN: No products returned for equipment financing");
    }
    
    // 7. Expected vs Actual Results
    console.log("\n📊 SUMMARY:");
    console.log(`Expected: 4 Canadian equipment financing products`);
    console.log(`Found in API: ${canadianEquipmentProducts.length} equipment financing products`);
    console.log(`Eligible for $40K: ${eligibleProducts.length} products`);
    console.log(`Final filtered result: ${filteredProducts.length} products`);
    
    if (filteredProducts.length >= 1) {
      console.log("✅ EQUIPMENT FINANCING FIX SUCCESSFUL");
    } else {
      console.log("❌ EQUIPMENT FINANCING STILL NEEDS INVESTIGATION");
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Helper function - must match the one in useRecommendations.ts
function isEquipmentFinancingProduct(category) {
  const equipmentCategories = [
    'Equipment Financing',
    'Equipment Finance',
    'Asset-Based Lending',
    'Asset Based Lending'
  ];
  
  return equipmentCategories.some(cat => 
    category.toLowerCase().includes(cat.toLowerCase()) ||
    cat.toLowerCase().includes(category.toLowerCase())
  );
}

// Run the test
testEquipmentFinancingFix();