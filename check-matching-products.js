/**
 * Check Matching Lender Products - Based on Current Application Data
 * Run this in browser console to see which products match your selections
 */

async function checkMatchingProducts() {
  console.log("🔍 CHECKING MATCHING LENDER PRODUCTS");
  console.log("===================================");

  // Get current application state from localStorage
  const savedState = localStorage.getItem('formData');
  if (!savedState) {
    console.log("❌ No application data found in localStorage");
    return;
  }

  const state = JSON.parse(savedState);
  
  // Extract key criteria from application
  const selectedCategory = state.step2?.selectedCategory || 'Not selected';
  const businessLocation = state.step1?.businessLocation || 'Not selected';
  const requestedAmount = state.step1?.requestedAmount || state.step1?.fundingAmount || 0;
  
  console.log("📋 YOUR APPLICATION CRITERIA:");
  console.log("Category:", selectedCategory);
  console.log("Location:", businessLocation);
  console.log("Amount:", requestedAmount);
  console.log("");

  // Fetch all available products
  try {
    const response = await fetch('/api/public/lenders');
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    const allProducts = data.products || [];
    
    console.log("📦 TOTAL PRODUCTS AVAILABLE:", allProducts.length);
    console.log("");

    // Filter matching products
    const matchingProducts = allProducts.filter(product => {
      // Category match
      const categoryMatch = product.category?.toLowerCase() === selectedCategory?.toLowerCase() ||
                           product.category?.toLowerCase().includes(selectedCategory?.toLowerCase()) ||
                           selectedCategory?.toLowerCase().includes(product.category?.toLowerCase());
      
      // Country match
      const countryMatch = product.country === businessLocation || 
                          (businessLocation === 'CA' && product.country === 'CA') ||
                          (businessLocation === 'US' && product.country === 'US');
      
      // Amount match
      const amountMatch = requestedAmount >= (product.amountMin || 0) && 
                         requestedAmount <= (product.amountMax || Infinity);
      
      return categoryMatch && countryMatch && amountMatch;
    });

    console.log("🎯 MATCHING PRODUCTS FOUND:", matchingProducts.length);
    console.log("");

    if (matchingProducts.length > 0) {
      console.log("✅ MATCHING LENDERS:");
      matchingProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.lenderName} - ${product.name}`);
        console.log(`   Category: ${product.category}`);
        console.log(`   Country: ${product.country}`);
        console.log(`   Amount Range: $${product.amountMin?.toLocaleString()} - $${product.amountMax?.toLocaleString()}`);
        console.log(`   Required Documents: ${product.requiredDocuments?.length || 0} documents`);
        if (product.requiredDocuments?.length > 0) {
          console.log(`   Documents: ${product.requiredDocuments.join(', ')}`);
        }
        console.log("");
      });

      // Show document requirements intersection
      const allRequiredDocs = matchingProducts
        .filter(p => p.requiredDocuments && p.requiredDocuments.length > 0)
        .map(p => p.requiredDocuments);

      if (allRequiredDocs.length > 0) {
        let commonDocs = allRequiredDocs[0];
        for (let i = 1; i < allRequiredDocs.length; i++) {
          commonDocs = commonDocs.filter(doc => allRequiredDocs[i].includes(doc));
        }

        console.log("📄 DOCUMENT REQUIREMENTS INTERSECTION:");
        if (commonDocs.length > 0) {
          console.log("✅ Documents required by ALL matching lenders:");
          commonDocs.forEach(doc => console.log(`   • ${doc}`));
        } else {
          console.log("⚠️ No documents required by ALL lenders");
          console.log("💡 You may need to provide documents for specific lenders");
        }
      }

    } else {
      console.log("❌ NO MATCHING PRODUCTS FOUND");
      console.log("");
      console.log("🔍 DEBUGGING - Let's check what went wrong:");
      
      // Check category matches
      const categoryMatches = allProducts.filter(p => 
        p.category?.toLowerCase() === selectedCategory?.toLowerCase() ||
        p.category?.toLowerCase().includes(selectedCategory?.toLowerCase()) ||
        selectedCategory?.toLowerCase().includes(p.category?.toLowerCase())
      );
      console.log(`📁 Products matching category "${selectedCategory}": ${categoryMatches.length}`);
      
      // Check country matches
      const countryMatches = allProducts.filter(p => p.country === businessLocation);
      console.log(`🌍 Products matching country "${businessLocation}": ${countryMatches.length}`);
      
      // Check amount matches
      const amountMatches = allProducts.filter(p => 
        requestedAmount >= (p.amountMin || 0) && 
        requestedAmount <= (p.amountMax || Infinity)
      );
      console.log(`💰 Products matching amount $${requestedAmount?.toLocaleString()}: ${amountMatches.length}`);
      
      console.log("");
      console.log("📊 AVAILABLE CATEGORIES:");
      const categories = [...new Set(allProducts.map(p => p.category))].sort();
      categories.forEach(cat => console.log(`   • ${cat}`));
      
      console.log("");
      console.log("🌍 AVAILABLE COUNTRIES:");
      const countries = [...new Set(allProducts.map(p => p.country))].sort();
      countries.forEach(country => console.log(`   • ${country}`));
    }

  } catch (error) {
    console.error("❌ Error fetching products:", error);
  }
}

// Auto-run the check
checkMatchingProducts();