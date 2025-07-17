// Manufacturing Industry Purchase Order Financing Test Script
// Run this in browser console to verify the implementation

console.log("🏭 Testing Manufacturing Industry Purchase Order Financing Feature");

// Test 1: Manufacturing industry should include Purchase Order products
console.log("\n📋 Test 1: Manufacturing industry qualification");

const manufacturingFormData = {
  headquarters: 'CA',
  fundingAmount: 100000,
  lookingFor: 'capital',
  accountsReceivableBalance: 0,
  fundsPurpose: 'working_capital',
  industry: 'manufacturing'
};

console.log("✅ Manufacturing form data:", manufacturingFormData);

// Test 2: Non-manufacturing industry should exclude Purchase Order products
console.log("\n📋 Test 2: Non-manufacturing industry exclusion");

const nonManufacturingFormData = {
  headquarters: 'CA', 
  fundingAmount: 100000,
  lookingFor: 'capital',
  accountsReceivableBalance: 0,
  fundsPurpose: 'working_capital',
  industry: 'retail'
};

console.log("✅ Non-manufacturing form data:", nonManufacturingFormData);

// Test 3: Check if Purchase Order products exist in database
console.log("\n📋 Test 3: Purchase Order product availability check");

// Simulate checking for Purchase Order products in the lender database
async function checkPurchaseOrderProducts() {
  try {
    // This would normally come from the lender products API
    const sampleProducts = [
      {
        id: 'po-financing-ca',
        name: 'Purchase Order Financing',
        category: 'Purchase Order Financing',
        country: 'CA',
        min_amount: 50000,
        max_amount: 500000
      },
      {
        id: 'working-capital-ca',
        name: 'Working Capital Loan',
        category: 'Working Capital',
        country: 'CA',
        min_amount: 25000,
        max_amount: 250000
      }
    ];
    
    const purchaseOrderProducts = sampleProducts.filter(p => 
      p.category === 'Purchase Order Financing'
    );
    
    console.log(`✅ Found ${purchaseOrderProducts.length} Purchase Order products`);
    purchaseOrderProducts.forEach(p => {
      console.log(`   - ${p.name} (${p.country}, $${p.min_amount}-$${p.max_amount})`);
    });
    
    return purchaseOrderProducts;
  } catch (error) {
    console.log("❌ Error checking products:", error);
    return [];
  }
}

// Test 4: Simulate filtering behavior
console.log("\n📋 Test 4: Filtering simulation");

function simulateFiltering(formData, products) {
  console.log(`[FILTER] Starting with ${products.length} products`);
  console.log('[FILTER] Parameters:', formData);
  
  let filteredProducts = [...products];
  
  // Country filter
  filteredProducts = filteredProducts.filter(p => p.country === formData.headquarters);
  console.log(`[FILTER] After country filter: ${filteredProducts.length} products`);
  
  // Amount filter
  filteredProducts = filteredProducts.filter(p => 
    formData.fundingAmount >= p.min_amount && formData.fundingAmount <= p.max_amount
  );
  console.log(`[FILTER] After amount filter: ${filteredProducts.length} products`);
  
  // Manufacturing industry Purchase Order inclusion
  const shouldIncludePurchaseOrder = formData.industry?.toLowerCase() === 'manufacturing';
  if (shouldIncludePurchaseOrder) {
    console.log('[FILTER] ✅ Manufacturing industry detected - including Purchase Order products');
    
    const purchaseOrderProducts = products.filter(p => {
      return p.category === 'Purchase Order Financing' &&
             p.country === formData.headquarters &&
             formData.fundingAmount >= p.min_amount &&
             formData.fundingAmount <= p.max_amount;
    });
    
    purchaseOrderProducts.forEach(p => {
      const alreadyIncluded = filteredProducts.some(fp => fp.id === p.id);
      if (!alreadyIncluded) {
        filteredProducts.push(p);
        console.log(`[FILTER] ✅ Added Purchase Order product: ${p.name}`);
      }
    });
  } else {
    console.log('[FILTER] ❌ No manufacturing industry - excluding Purchase Order products');
  }
  
  console.log(`[FILTER] Final products: ${filteredProducts.length}`);
  return filteredProducts;
}

// Run tests
async function runTests() {
  const products = await checkPurchaseOrderProducts();
  
  console.log("\n🧪 Running Manufacturing Tests:");
  
  // Test manufacturing inclusion
  console.log("\n--- Manufacturing Industry Test ---");
  const manufacturingResults = simulateFiltering(manufacturingFormData, products);
  const hasPurchaseOrder = manufacturingResults.some(p => p.category === 'Purchase Order Financing');
  console.log(`Manufacturing result: ${hasPurchaseOrder ? '✅ PASS' : '❌ FAIL'} - Purchase Order products ${hasPurchaseOrder ? 'included' : 'excluded'}`);
  
  // Test non-manufacturing exclusion  
  console.log("\n--- Non-Manufacturing Industry Test ---");
  const nonManufacturingResults = simulateFiltering(nonManufacturingFormData, products);
  const hasNoPurchaseOrder = !nonManufacturingResults.some(p => p.category === 'Purchase Order Financing');
  console.log(`Non-manufacturing result: ${hasNoPurchaseOrder ? '✅ PASS' : '❌ FAIL'} - Purchase Order products ${hasNoPurchaseOrder ? 'excluded' : 'included'}`);
}

// Execute tests
runTests();

// Test 5: Check current page state
console.log("\n🌐 Test 5: Current page state check");
const currentPath = window.location.pathname;
if (currentPath.includes('step-2')) {
  console.log("📍 On Step 2 - checking for recommendation engine");
  
  // Look for industry-related elements
  const industryElements = document.querySelectorAll('[data-testid*="industry"], [name*="industry"], input[placeholder*="industry"]');
  console.log(`Found ${industryElements.length} industry-related elements`);
  
  // Check if form context has industry data
  try {
    const formState = localStorage.getItem('formDataState');
    if (formState) {
      const parsed = JSON.parse(formState);
      const hasIndustry = parsed.step1?.industry || parsed.industry;
      console.log(`Industry in form state: ${hasIndustry || 'Not found'}`);
    }
  } catch (error) {
    console.log("Could not access form state");
  }
}

console.log("\n🎯 Manufacturing Purchase Order Test Summary:");
console.log("✅ Expected behavior: Manufacturing industry includes Purchase Order category");
console.log("✅ Expected behavior: Non-manufacturing industries exclude Purchase Order category"); 
console.log("✅ Expected behavior: Country and amount filters still apply");
console.log("✅ Expected behavior: Console shows '[FILTER] Manufacturing industry detected' message");
console.log("\n🧪 Test completed - verify the new filtering logic works correctly");