/**
 * LIVE STEP 5 DEBUGGING
 * Run this in browser console while on Step 5 to see exactly what's happening
 */

async function testDirectIntersection() {
  console.log("🔧 DEBUGGING STEP 5 DOCUMENT INTERSECTION");
  
  // Test the exact parameters that would be used in Step 5
  const testParams = {
    selectedCategory: "Equipment Financing",
    businessLocation: "canada", 
    fundingAmount: 50000
  };
  
  console.log("Test parameters:", testParams);
  
  try {
    // Import the intersection function
    const { getDocumentRequirementsIntersection } = await import('./client/src/lib/documentIntersection.ts');
    
    const result = await getDocumentRequirementsIntersection(
      testParams.selectedCategory,
      testParams.businessLocation,
      testParams.fundingAmount
    );
    
    console.log("✅ Intersection result:", result);
    return result;
    
  } catch (error) {
    console.error("❌ Intersection failed:", error);
    return null;
  }
}

async function testApiDirect() {
  console.log("🔧 TESTING API DIRECT");
  
  try {
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    console.log("✅ API Response:", data);
    
    if (data.products) {
      const equipmentProducts = data.products.filter(p => p.category === 'Equipment Financing');
      console.log("🏗️ Equipment Financing products:", equipmentProducts);
      
      const canadianEquipment = equipmentProducts.filter(p => p.country === 'CA');
      console.log("🇨🇦 Canadian equipment products:", canadianEquipment);
    }
    
    return data;
    
  } catch (error) {
    console.error("❌ API failed:", error);
    return null;
  }
}

// Run both tests
async function runStep5Debug() {
  console.log("🚀 STARTING STEP 5 DEBUG SESSION");
  
  // Test 1: Direct API call
  console.log("\n=== TEST 1: Direct API ===");
  const apiResult = await testApiDirect();
  
  // Test 2: Document intersection
  console.log("\n=== TEST 2: Document Intersection ===");
  const intersectionResult = await testDirectIntersection();
  
  console.log("\n=== SUMMARY ===");
  console.log("API working:", apiResult ? "✅" : "❌");
  console.log("Intersection working:", intersectionResult ? "✅" : "❌");
  
  if (intersectionResult) {
    console.log("Has matches:", intersectionResult.hasMatches);
    console.log("Eligible lenders:", intersectionResult.eligibleLenders.length);
    console.log("Required documents:", intersectionResult.requiredDocuments.length);
  }
}

// Auto-run
runStep5Debug();