/**
 * Debug Canadian Equipment Financing API Data
 * Investigate the exact data structure and field values in the API response
 * Date: January 9, 2025
 */

async function debugCanadianEquipmentAPI() {
  console.log("🔍 DEBUGGING CANADIAN EQUIPMENT FINANCING API DATA");
  console.log("=".repeat(60));
  
  try {
    // Fetch all products from API
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      console.error("❌ API request failed:", data);
      return;
    }
    
    const products = data.products;
    console.log(`✅ API returned ${products.length} total products`);
    
    // Debug: Log the structure of first few products
    console.log("\n📋 SAMPLE PRODUCT STRUCTURE:");
    console.log("=".repeat(40));
    products.slice(0, 3).forEach((product, index) => {
      console.log(`Product ${index + 1}:`, {
        id: product.id,
        name: product.name || product.lender,
        geography: product.geography,
        country: product.country,
        productCategory: product.productCategory,
        product: product.product,
        type: product.type,
        minAmount: product.minAmount || product.minAmountUsd,
        maxAmount: product.maxAmount || product.maxAmountUsd,
        requiredDocuments: product.requiredDocuments?.length || 0
      });
    });
    
    // Look for Canadian products (any field that might indicate Canada)
    console.log("\n🇨🇦 SEARCHING FOR CANADIAN PRODUCTS:");
    console.log("=".repeat(40));
    
    const canadianProducts = products.filter(p => {
      const hasCanada = 
        (p.geography && p.geography.includes && p.geography.includes('CA')) ||
        (p.country && p.country.toLowerCase().includes('canada')) ||
        (p.geography && typeof p.geography === 'string' && p.geography.includes('Canada')) ||
        (Array.isArray(p.geography) && p.geography.includes('Canada'));
      
      if (hasCanada) {
        console.log(`Found Canadian product: ${p.name || p.lender}`, {
          geography: p.geography,
          country: p.country,
          productType: p.productCategory || p.product || p.type
        });
      }
      
      return hasCanada;
    });
    
    console.log(`\n📊 Found ${canadianProducts.length} Canadian products total`);
    
    // Look for Equipment Financing products (any field that might indicate equipment)
    console.log("\n🏗️ SEARCHING FOR EQUIPMENT FINANCING PRODUCTS:");
    console.log("=".repeat(50));
    
    const equipmentProducts = products.filter(p => {
      const hasEquipment = 
        (p.productCategory && p.productCategory.toLowerCase().includes('equipment')) ||
        (p.product && p.product.toLowerCase().includes('equipment')) ||
        (p.type && p.type.toLowerCase().includes('equipment'));
      
      if (hasEquipment) {
        console.log(`Found equipment product: ${p.name || p.lender}`, {
          productCategory: p.productCategory,
          product: p.product,
          type: p.type,
          geography: p.geography,
          country: p.country
        });
      }
      
      return hasEquipment;
    });
    
    console.log(`\n📊 Found ${equipmentProducts.length} equipment financing products total`);
    
    // Look for the intersection: Canadian + Equipment
    console.log("\n🎯 SEARCHING FOR CANADIAN EQUIPMENT FINANCING:");
    console.log("=".repeat(50));
    
    const canadianEquipmentProducts = products.filter(p => {
      const hasCanada = 
        (p.geography && p.geography.includes && p.geography.includes('CA')) ||
        (p.country && p.country.toLowerCase().includes('canada')) ||
        (p.geography && typeof p.geography === 'string' && p.geography.includes('Canada')) ||
        (Array.isArray(p.geography) && p.geography.includes('Canada'));
      
      const hasEquipment = 
        (p.productCategory && p.productCategory.toLowerCase().includes('equipment')) ||
        (p.product && p.product.toLowerCase().includes('equipment')) ||
        (p.type && p.type.toLowerCase().includes('equipment'));
      
      const matches = hasCanada && hasEquipment;
      
      if (matches) {
        console.log(`✅ MATCH: ${p.name || p.lender}`, {
          geography: p.geography,
          country: p.country,
          productCategory: p.productCategory,
          product: p.product,
          type: p.type,
          minAmount: p.minAmount || p.minAmountUsd,
          maxAmount: p.maxAmount || p.maxAmountUsd,
          requiredDocuments: p.requiredDocuments?.slice(0, 3) || []
        });
      }
      
      return matches;
    });
    
    console.log(`\n🎯 FINAL RESULT: ${canadianEquipmentProducts.length} Canadian Equipment Financing products found`);
    
    // Check for the expected 4 lenders mentioned in the diagnosis
    console.log("\n🔍 SEARCHING FOR EXPECTED LENDERS:");
    console.log("=".repeat(40));
    
    const expectedLenders = [
      'Stride Capital Corp',
      'Accord Financial Corp', 
      'Dynamic Capital Equipment Finance',
      'Meridian OneCap Credit Corp'
    ];
    
    expectedLenders.forEach(expectedName => {
      const found = products.find(p => 
        (p.name && p.name.includes(expectedName.split(' ')[0])) ||
        (p.lender && p.lender.includes(expectedName.split(' ')[0]))
      );
      
      if (found) {
        console.log(`✅ Found: ${expectedName}`, {
          actualName: found.name || found.lender,
          geography: found.geography,
          country: found.country,
          productType: found.productCategory || found.product || found.type
        });
      } else {
        console.log(`❌ Missing: ${expectedName}`);
      }
    });
    
    // Analyze the data field variations
    console.log("\n📊 FIELD ANALYSIS:");
    console.log("=".repeat(30));
    
    const geographyValues = [...new Set(products.map(p => JSON.stringify(p.geography)).filter(Boolean))];
    const countryValues = [...new Set(products.map(p => p.country).filter(Boolean))];
    const productCategoryValues = [...new Set(products.map(p => p.productCategory).filter(Boolean))];
    const productValues = [...new Set(products.map(p => p.product).filter(Boolean))];
    const typeValues = [...new Set(products.map(p => p.type).filter(Boolean))];
    
    console.log("Geography field values:", geographyValues.slice(0, 5));
    console.log("Country field values:", countryValues.slice(0, 5));
    console.log("ProductCategory values:", productCategoryValues.slice(0, 5));
    console.log("Product values:", productValues.slice(0, 5));
    console.log("Type values:", typeValues.slice(0, 5));
    
    // Generate specific API query recommendations
    console.log("\n🔧 RECOMMENDED FILTER LOGIC:");
    console.log("=".repeat(35));
    
    if (canadianEquipmentProducts.length === 0) {
      console.log("❌ Current filtering logic is not working. Recommendations:");
      
      if (geographyValues.length > 0) {
        console.log("1. Try geography field filtering");
        console.log("   Example: products.filter(p => p.geography?.includes('CA'))");
      }
      
      if (countryValues.length > 0) {
        console.log("2. Try country field filtering");
        console.log("   Example: products.filter(p => p.country === 'Canada')");
      }
      
      console.log("3. Use case-insensitive equipment matching");
      console.log("   Example: products.filter(p => p.product?.toLowerCase().includes('equipment'))");
    } else {
      console.log(`✅ Found ${canadianEquipmentProducts.length} matches with current logic`);
    }
    
  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

// Run the debug analysis
console.log("🚀 Starting Canadian Equipment Financing API Debug...");
debugCanadianEquipmentAPI();