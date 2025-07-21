// Auto-run Step 2 validation and report findings
// Load validation script and execute

console.log('🔍 AUTO-RUNNING STEP 2 VALIDATION');

// Load the validateProducts function
fetch('/validate-step2-filtering.js')
  .then(response => response.text())
  .then(script => {
    eval(script);
    
    // Wait for products to load, then run validation
    setTimeout(() => {
      console.log('\n=== STEP 2 PRODUCT MATCH VERIFICATION ===');
      
      const results = window.validateProducts();
      
      if (results) {
        console.log('\n📊 VALIDATION SUMMARY:');
        console.log(`Total products: ${results.totalProducts}`);
        console.log(`Working Capital found: ${results.workingCapitalFound}`);
        console.log(`Working Capital passed: ${results.workingCapitalPassed}`);
        console.log(`Filtered out: ${results.filteredOut}`);
        
        // Specific analysis for user question
        if (results.workingCapitalFound > results.workingCapitalPassed) {
          console.log('\n🚨 ISSUE IDENTIFIED: Some Working Capital products are being filtered out');
          console.log(`Expected: ${results.workingCapitalFound} Working Capital products`);
          console.log(`Actual: ${results.workingCapitalPassed} Working Capital products shown`);
          console.log('Check console output above for specific exclusion reasons');
        } else {
          console.log('\n✅ All Working Capital products are passing filters');
        }
      }
    }, 2000);
  })
  .catch(err => console.error('❌ Failed to load validation script:', err));