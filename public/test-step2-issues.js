// Test Step 2 Product Categories for Common Issues
// Run this in browser console to identify filtering problems

console.log("🔍 Starting Step 2 Product Categories Diagnostic Test");

// Test different scenarios that commonly cause issues
const testScenarios = [
  {
    name: "Canadian Working Capital",
    formData: {
      headquarters: "CA",
      fundingAmount: 40000,
      lookingFor: "capital",
      accountsReceivableBalance: 0,
      fundsPurpose: "working_capital"
    }
  },
  {
    name: "US Equipment Financing",
    formData: {
      headquarters: "US", 
      fundingAmount: 50000,
      lookingFor: "equipment",
      accountsReceivableBalance: 0,
      fundsPurpose: "equipment"
    }
  },
  {
    name: "Invoice Factoring with AR",
    formData: {
      headquarters: "CA",
      fundingAmount: 25000, 
      lookingFor: "capital",
      accountsReceivableBalance: 15000,
      fundsPurpose: "working_capital"
    }
  },
  {
    name: "Invoice Factoring without AR", 
    formData: {
      headquarters: "CA",
      fundingAmount: 25000,
      lookingFor: "capital", 
      accountsReceivableBalance: 0,
      fundsPurpose: "working_capital"
    }
  }
];

// Function to test filtering logic
async function testProductFiltering() {
  try {
    // Get products from IndexedDB cache or API
    let products = [];
    try {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('react-query-offline-cache');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      const transaction = db.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get('lender-products');
      
      products = await new Promise((resolve) => {
        request.onsuccess = () => {
          const data = request.result?.data;
          resolve(data?.products || data || []);
        };
        request.onerror = () => resolve([]);
      });
    } catch (e) {
      console.log("Could not get products from cache, trying API...");
      const response = await fetch('/api/public/lenders');
      const data = await response.json();
      products = data.products || data || [];
    }

    console.log(`📊 Total products available: ${products.length}`);
    
    if (products.length === 0) {
      console.error("❌ No products found - cannot test filtering");
      return;
    }

    for (const scenario of testScenarios) {
      console.log(`\n🧪 Testing: ${scenario.name}`);
      console.log("Form data:", scenario.formData);
      
      // Apply filtering logic (simplified version)
      let filtered = products.filter(p => {
        // Country filter
        const countryMatch = p.country === scenario.formData.headquarters;
        
        // Amount filter  
        const minAmount = p.minAmount || p.amountMin || p.amount_min || 0;
        const maxAmount = p.maxAmount || p.amountMax || p.amount_max || Infinity;
        const amountMatch = scenario.formData.fundingAmount >= minAmount && 
                           scenario.formData.fundingAmount <= maxAmount;
        
        // Invoice factoring exclusion
        const isInvoiceFactoring = p.category?.toLowerCase().includes('factoring') || 
                                  p.category?.toLowerCase().includes('invoice');
        const factorExclusion = isInvoiceFactoring && scenario.formData.accountsReceivableBalance === 0;
        
        // Equipment financing exclusion
        const isEquipment = p.category?.toLowerCase().includes('equipment');
        const equipmentExclusion = isEquipment && 
                                  scenario.formData.lookingFor !== 'equipment' && 
                                  scenario.formData.lookingFor !== 'both' &&
                                  scenario.formData.fundsPurpose !== 'equipment';
        
        return countryMatch && amountMatch && !factorExclusion && !equipmentExclusion;
      });
      
      // Group by category
      const categoryGroups = {};
      filtered.forEach(p => {
        if (!categoryGroups[p.category]) {
          categoryGroups[p.category] = [];
        }
        categoryGroups[p.category].push(p);
      });
      
      console.log(`📊 Filtered products: ${filtered.length}`);
      console.log(`📂 Categories found: ${Object.keys(categoryGroups).length}`);
      Object.entries(categoryGroups).forEach(([category, products]) => {
        console.log(`  • ${category}: ${products.length} products`);
      });
      
      // Check for common missing products
      const commonMissing = [
        'Working Capital',
        'Business Line of Credit', 
        'Equipment Financing',
        'Invoice Factoring'
      ];
      
      const missing = commonMissing.filter(cat => !Object.keys(categoryGroups).includes(cat));
      if (missing.length > 0) {
        console.log(`⚠️ Missing expected categories: ${missing.join(', ')}`);
      }
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testProductFiltering();