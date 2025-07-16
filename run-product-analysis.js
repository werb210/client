/**
 * IMMEDIATE PRODUCT ANALYSIS
 * Based on your current application: Working Capital, CA, $35,000
 */

async function runProductAnalysis() {
  console.log("🔍 ANALYZING YOUR APPLICATION");
  console.log("Category: Working Capital");
  console.log("Country: CA (Canada)");
  console.log("Amount: $35,000");
  console.log("");

  try {
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    const allProducts = data.products || [];
    
    // Filter for Working Capital, CA, $35,000
    const matches = allProducts.filter(product => {
      const categoryMatch = product.category?.toLowerCase().includes('working') ||
                           product.category?.toLowerCase().includes('capital') ||
                           product.category === 'Working Capital';
      
      const countryMatch = product.country === 'CA';
      
      const amountMatch = 35000 >= (product.amountMin || 0) && 
                         35000 <= (product.amountMax || Infinity);
      
      return categoryMatch && countryMatch && amountMatch;
    });

    console.log(`✅ FOUND ${matches.length} MATCHING PRODUCTS:`);
    matches.forEach((product, i) => {
      console.log(`${i+1}. ${product.lenderName} - ${product.name}`);
      console.log(`   Range: $${product.amountMin?.toLocaleString()} - $${product.amountMax?.toLocaleString()}`);
      console.log(`   Documents: ${product.requiredDocuments?.join(', ') || 'None specified'}`);
      console.log("");
    });

    // Calculate document intersection
    const docsNeeded = matches
      .filter(p => p.requiredDocuments?.length > 0)
      .map(p => p.requiredDocuments);
    
    if (docsNeeded.length > 0) {
      let commonDocs = docsNeeded[0];
      for (let i = 1; i < docsNeeded.length; i++) {
        commonDocs = commonDocs.filter(doc => docsNeeded[i].includes(doc));
      }
      
      console.log("📄 DOCUMENTS NEEDED BY ALL MATCHING LENDERS:");
      commonDocs.forEach(doc => console.log(`   • ${doc}`));
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

runProductAnalysis();