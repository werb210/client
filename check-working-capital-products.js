/**
 * Check Working Capital Products for Canada $35K
 * Run this in browser console to see exactly what lender products match your criteria
 */

async function checkWorkingCapitalProducts() {
  console.log("🔍 CHECKING WORKING CAPITAL PRODUCTS");
  console.log("===================================");
  
  // Your exact criteria
  const criteria = {
    category: "Working Capital",
    country: "CA", 
    fundingAmount: 35000
  };
  
  console.log("📋 Search Criteria:", criteria);
  console.log("");
  
  try {
    // Fetch all products from staff backend
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    if (data.success && data.products) {
      const allProducts = data.products;
      console.log(`📦 Total Products in Database: ${allProducts.length}`);
      
      // Show all unique categories available
      const allCategories = [...new Set(allProducts.map(p => p.category))].sort();
      console.log("📋 All Available Categories:", allCategories);
      
      // Filter for Working Capital products
      const workingCapitalProducts = allProducts.filter(product => {
        const categoryMatch = product.category?.toLowerCase().includes('working capital') ||
                            product.category?.toLowerCase().includes('working_capital') ||
                            product.category === 'Working Capital';
        return categoryMatch;
      });
      
      console.log("");
      console.log(`💼 Working Capital Products Found: ${workingCapitalProducts.length}`);
      workingCapitalProducts.forEach(p => {
        console.log(`   - ${p.name} (${p.lender_name || p.lenderName}): ${p.category} | ${p.country} | $${p.amountMin || p.min_amount || 0}-$${p.amountMax || p.max_amount || 'unlimited'}`);
      });
      
      // Filter for Canada
      const canadianWorkingCapital = workingCapitalProducts.filter(p => p.country === 'CA');
      console.log("");
      console.log(`🇨🇦 Canadian Working Capital Products: ${canadianWorkingCapital.length}`);
      canadianWorkingCapital.forEach(p => {
        console.log(`   - ${p.name} (${p.lender_name || p.lenderName}): $${p.amountMin || p.min_amount || 0}-$${p.amountMax || p.max_amount || 'unlimited'}`);
      });
      
      // Filter for $35K funding amount
      const eligibleProducts = canadianWorkingCapital.filter(product => {
        const minAmount = product.amountMin || product.min_amount || 0;
        const maxAmount = product.amountMax || product.max_amount || Number.MAX_SAFE_INTEGER;
        return minAmount <= 35000 && maxAmount >= 35000;
      });
      
      console.log("");
      console.log(`💰 Products Eligible for $35K: ${eligibleProducts.length}`);
      eligibleProducts.forEach(product => {
        const minAmount = product.amountMin || product.min_amount || 0;
        const maxAmount = product.amountMax || product.max_amount || 'unlimited';
        const docs = product.doc_requirements || 
                     product.documentRequirements || 
                     product.requiredDocuments || 
                     product.required_documents || 
                     [];
        
        console.log(`   ✅ ${product.name}`);
        console.log(`      Lender: ${product.lender_name || product.lenderName}`);
        console.log(`      Amount Range: $${minAmount.toLocaleString()} - $${maxAmount === Number.MAX_SAFE_INTEGER ? 'unlimited' : maxAmount.toLocaleString()}`);
        console.log(`      Documents Required: ${docs.length} (${docs.join(', ')})`);
        console.log("");
      });
      
      // Check what other capital products might be included
      console.log("🔍 OTHER CAPITAL PRODUCTS THAT MIGHT MATCH:");
      const capitalCategories = ['Business Line of Credit', 'Term Loan', 'SBA Loan', 'Asset Based Lending'];
      
      capitalCategories.forEach(category => {
        const categoryProducts = allProducts.filter(p => 
          p.category?.toLowerCase().includes(category.toLowerCase()) &&
          p.country === 'CA' &&
          (p.amountMin || p.min_amount || 0) <= 35000 &&
          (p.amountMax || p.max_amount || Number.MAX_SAFE_INTEGER) >= 35000
        );
        
        if (categoryProducts.length > 0) {
          console.log(`   ${category}: ${categoryProducts.length} products`);
          categoryProducts.forEach(p => {
            console.log(`      - ${p.name} (${p.lender_name || p.lenderName})`);
          });
        }
      });
      
    } else {
      console.error("❌ Failed to fetch products:", data);
    }
    
  } catch (error) {
    console.error("❌ Error fetching products:", error);
  }
}

checkWorkingCapitalProducts();