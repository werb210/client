/**
 * Get All Lender Product Categories
 * Copy and paste this into browser console to see all available categories
 */

fetch('/api/public/lenders')
  .then(response => response.json())
  .then(data => {
    if (data.success && data.products) {
      console.log(`📦 Total Products: ${data.products.length}`);
      console.log("");
      
      // Get all unique categories
      const categories = [...new Set(data.products.map(p => p.category))].sort();
      
      console.log("📋 ALL LENDER PRODUCT CATEGORIES:");
      console.log("================================");
      categories.forEach((category, index) => {
        const count = data.products.filter(p => p.category === category).length;
        console.log(`${index + 1}. ${category} (${count} products)`);
      });
      
      console.log("");
      console.log("🇨🇦 CANADIAN PRODUCTS BY CATEGORY:");
      console.log("==================================");
      categories.forEach(category => {
        const canadianProducts = data.products.filter(p => p.category === category && p.country === 'CA');
        if (canadianProducts.length > 0) {
          console.log(`${category}: ${canadianProducts.length} products`);
          canadianProducts.forEach(p => {
            const minAmount = p.min_amount || p.amountMin || 0;
            const maxAmount = p.max_amount || p.amountMax || 'unlimited';
            console.log(`   - ${p.name} (${p.lender_name}): $${minAmount.toLocaleString()} - $${maxAmount === 'unlimited' ? 'unlimited' : maxAmount.toLocaleString()}`);
          });
          console.log("");
        }
      });
      
      console.log("🇺🇸 US PRODUCTS BY CATEGORY:");
      console.log("============================");
      categories.forEach(category => {
        const usProducts = data.products.filter(p => p.category === category && p.country === 'US');
        if (usProducts.length > 0) {
          console.log(`${category}: ${usProducts.length} products`);
          usProducts.forEach(p => {
            const minAmount = p.min_amount || p.amountMin || 0;
            const maxAmount = p.max_amount || p.amountMax || 'unlimited';
            console.log(`   - ${p.name} (${p.lender_name}): $${minAmount.toLocaleString()} - $${maxAmount === 'unlimited' ? 'unlimited' : maxAmount.toLocaleString()}`);
          });
          console.log("");
        }
      });
      
    } else {
      console.error("❌ Failed to fetch products");
    }
  })
  .catch(error => console.error("❌ Error:", error));