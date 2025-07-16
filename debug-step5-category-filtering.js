/**
 * DEBUG STEP 5 CATEGORY FILTERING
 * Run this in browser console to see why Working Capital shows Business Line of Credit documents
 */

async function debugStep5CategoryFiltering() {
  console.log("🔍 DEBUGGING STEP 5 CATEGORY FILTERING");
  console.log("====================================");
  
  // Get current form state
  const formData = JSON.parse(localStorage.getItem('formData') || '{}');
  console.log("📋 Current Form Data:");
  console.log("- Selected Category (step1):", formData.step1?.selectedCategory);
  console.log("- Looking For (step1):", formData.step1?.lookingFor);
  console.log("- Business Location (step1):", formData.step1?.businessLocation);
  console.log("- Funding Amount (step1):", formData.step1?.fundingAmount);
  
  // Fetch all products like Step 5 does
  try {
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    if (data.success && data.products) {
      const allProducts = data.products;
      console.log("");
      console.log(`📦 Total Products Available: ${allProducts.length}`);
      
      // Show what categories exist
      const allCategories = [...new Set(allProducts.map(p => p.category))];
      console.log("📋 All Available Categories:", allCategories);
      
      // Test the filtering logic that Step 5 uses
      const selectedProductType = formData.step1?.selectedCategory || "Working Capital";
      const businessLocation = formData.step1?.businessLocation || "CA";
      const fundingAmount = formData.step1?.fundingAmount || 35000;
      
      console.log("");
      console.log("🎯 FILTERING CRITERIA:");
      console.log("- selectedProductType:", selectedProductType);
      console.log("- businessLocation:", businessLocation);
      console.log("- fundingAmount:", fundingAmount);
      
      // Apply the same filtering logic as documentIntersection.ts
      const countryCode = businessLocation === 'united-states' ? 'US' : 
                         businessLocation === 'canada' ? 'CA' : 
                         businessLocation;
      
      console.log("- Mapped country code:", countryCode);
      
      const eligibleLenders = allProducts.filter(product => {
        // Category match - exact same logic as documentIntersection.ts
        const productCategory = product.category?.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
        const searchCategory = selectedProductType?.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
        
        const directMatch = product.category?.toLowerCase() === selectedProductType?.toLowerCase();
        const normalizedMatch = productCategory === searchCategory;
        
        const titleCaseSearch = selectedProductType?.split(/[_\s-]/).map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
        const titleCaseMatch = product.category === titleCaseSearch;
        
        const categoryMatch = directMatch || normalizedMatch || titleCaseMatch;
        
        // Country match
        const countryMatch = product.country === countryCode;
        
        // Amount range match
        const minAmount = product.amountMin || product.min_amount || 0;
        const maxAmount = product.amountMax || product.max_amount || Number.MAX_SAFE_INTEGER;
        const amountMatch = minAmount <= fundingAmount && maxAmount >= fundingAmount;
        
        const matches = categoryMatch && countryMatch && amountMatch;
        
        if (matches) {
          console.log(`✅ MATCH: ${product.name} (${product.category}) - ${product.country} - $${minAmount}-$${maxAmount}`);
        }
        
        return matches;
      });
      
      console.log("");
      console.log(`🎯 ELIGIBLE LENDERS: ${eligibleLenders.length}`);
      eligibleLenders.forEach(lender => {
        const docs = lender.doc_requirements || 
                     lender.documentRequirements || 
                     lender.requiredDocuments || 
                     lender.required_documents || 
                     [];
        console.log(`   - ${lender.lender_name || lender.name}: ${lender.category} (${docs.length} docs: ${docs.join(', ')})`);
      });
      
      // Check if "Business Line of Credit" products are being included
      const businessLineProducts = allProducts.filter(p => 
        p.category?.toLowerCase().includes('business line of credit') ||
        p.category?.toLowerCase().includes('line of credit')
      );
      
      console.log("");
      console.log("🏦 BUSINESS LINE OF CREDIT PRODUCTS:");
      businessLineProducts.forEach(p => {
        const categoryMatch = p.category?.toLowerCase() === selectedProductType?.toLowerCase();
        const countryMatch = p.country === countryCode;
        const minAmount = p.amountMin || p.min_amount || 0;
        const maxAmount = p.amountMax || p.max_amount || Number.MAX_SAFE_INTEGER;
        const amountMatch = minAmount <= fundingAmount && maxAmount >= fundingAmount;
        
        console.log(`   - ${p.name}: category="${p.category}" country=${p.country} amount=$${minAmount}-$${maxAmount}`);
        console.log(`     Category Match: ${categoryMatch}, Country Match: ${countryMatch}, Amount Match: ${amountMatch}`);
        
        if (categoryMatch && countryMatch && amountMatch) {
          console.log("     ⚠️ THIS PRODUCT IS BEING INCLUDED! This explains the Business Line of Credit documents.");
        }
      });
      
    } else {
      console.error("❌ Failed to fetch products");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

debugStep5CategoryFiltering();