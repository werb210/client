/**
 * List All Lender Product Categories
 * Show exactly what categories exist in the staff database
 */

async function listLenderCategories() {
  console.log("📋 LISTING ALL LENDER PRODUCT CATEGORIES");
  console.log("=".repeat(50));
  
  try {
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      console.error("❌ API request failed:", data);
      return;
    }
    
    const products = data.products;
    console.log(`✅ API returned ${products.length} total products`);
    
    // Extract all unique categories
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    const countries = [...new Set(products.map(p => p.country).filter(Boolean))];
    
    console.log("\n📊 AVAILABLE CATEGORIES:");
    console.log("=".repeat(30));
    categories.forEach((category, index) => {
      const count = products.filter(p => p.category === category).length;
      const canadianCount = products.filter(p => p.category === category && p.country === 'CA').length;
      const usCount = products.filter(p => p.category === category && p.country === 'US').length;
      
      console.log(`${index + 1}. ${category}`);
      console.log(`   Total: ${count} products (CA: ${canadianCount}, US: ${usCount})`);
    });
    
    console.log("\n🌍 AVAILABLE COUNTRIES:");
    console.log("=".repeat(25));
    countries.forEach(country => {
      const count = products.filter(p => p.country === country).length;
      console.log(`- ${country}: ${count} products`);
    });
    
    // Show products by category and country
    console.log("\n📋 DETAILED BREAKDOWN:");
    console.log("=".repeat(30));
    
    categories.forEach(category => {
      console.log(`\n📂 ${category.toUpperCase()}`);
      
      const categoryProducts = products.filter(p => p.category === category);
      
      // Group by country
      const byCountry = {};
      categoryProducts.forEach(product => {
        const country = product.country || 'Unknown';
        if (!byCountry[country]) byCountry[country] = [];
        byCountry[country].push(product);
      });
      
      Object.keys(byCountry).forEach(country => {
        console.log(`  🇨🇦🇺🇸 ${country}:`);
        byCountry[country].forEach(product => {
          console.log(`    - ${product.name || product.lender} (${product.id})`);
          if (product.requiredDocuments && product.requiredDocuments.length > 0) {
            console.log(`      Documents: ${product.requiredDocuments.slice(0, 3).join(', ')}${product.requiredDocuments.length > 3 ? '...' : ''}`);
          }
        });
      });
    });
    
    // Check specifically for Equipment Financing
    console.log("\n🔍 EQUIPMENT FINANCING CHECK:");
    console.log("=".repeat(35));
    
    const equipmentCategories = categories.filter(cat => 
      cat.toLowerCase().includes('equipment') || 
      cat.toLowerCase().includes('asset') ||
      cat.toLowerCase().includes('machinery')
    );
    
    if (equipmentCategories.length === 0) {
      console.log("❌ NO EQUIPMENT FINANCING CATEGORIES FOUND");
      console.log("   Expected: 'Equipment Financing' category");
      console.log("   Available: " + categories.join(', '));
    } else {
      console.log("✅ Equipment-related categories found:");
      equipmentCategories.forEach(cat => console.log(`   - ${cat}`));
    }
    
    // Show missing categories that should exist
    console.log("\n⚠️  MISSING EXPECTED CATEGORIES:");
    console.log("=".repeat(40));
    
    const expectedCategories = [
      'Equipment Financing',
      'Asset Based Lending', 
      'Purchase Order Financing',
      'Invoice Factoring',
      'SBA Loan'
    ];
    
    const missingCategories = expectedCategories.filter(expected => 
      !categories.some(actual => actual.toLowerCase() === expected.toLowerCase())
    );
    
    if (missingCategories.length > 0) {
      console.log("❌ Missing categories:");
      missingCategories.forEach(missing => console.log(`   - ${missing}`));
    } else {
      console.log("✅ All expected categories present");
    }
    
  } catch (error) {
    console.error("❌ Failed to list categories:", error);
  }
}

// Run the category listing
listLenderCategories();