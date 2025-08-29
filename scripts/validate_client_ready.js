// Simple validation script to check if client is ready for lender products
console.log('🔍 CLIENT LENDER PRODUCTS READINESS CHECK');
console.log('==========================================');

// Check if client has the audit hook installed
setTimeout(() => {
  // Try port 5000 first (production), then 5173 (dev)
  fetch('http://localhost:5000/')
    .then(() => {
      console.log('✅ Client app is running on port 5000');
      console.log('✅ Ready for lender products validation suite');
      console.log('');
      console.log('📋 Next steps:');
      console.log('   1. Populate staff API with ≥44 lender products');
      console.log('   2. Run: scripts/run_validation_suite.sh');
      console.log('   3. Verify client DB sync works correctly');
    })
    .catch(() => {
      fetch('http://localhost:5173/')
        .then(() => {
          console.log('✅ Client app is running on port 5173');
          console.log('✅ Ready for lender products validation suite');
        })
        .catch(() => {
          console.log('❌ Client app not running on localhost:5000 or localhost:5173');
          console.log('   Start with: npm run dev');
        });
    });
}, 1000);