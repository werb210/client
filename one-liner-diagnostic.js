// COPY AND PASTE THIS INTO BROWSER CONSOLE FOR INSTANT DIAGNOSIS
(async () => {
  console.log('🔍 API CONFIGURATION DIAGNOSTIC');
  console.log('============================');
  
  // Check what API_BASE_URL is actually being used
  try {
    const response = await fetch('/debug-env');
    console.log('Environment check failed, using direct test...');
  } catch (e) {
    console.log('Direct environment check not available');
  }
  
  // Test all possible endpoints
  const tests = [
    { name: 'Relative API', url: '/api/public/lenders' },
    { name: 'Direct Express', url: 'http://localhost:5000/api/public/lenders' },
    { name: 'Express Health', url: 'http://localhost:5000/api/health' },
    { name: 'Staff Direct', url: 'https://staffportal.replit.app/api/public/lenders' }
  ];
  
  for (const test of tests) {
    try {
      console.log(`🔗 Testing ${test.name}: ${test.url}`);
      const response = await fetch(test.url);
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch { data = text; }
      
      if (response.ok) {
        console.log(`✅ ${test.name}: SUCCESS (${response.status})`);
        if (data.products) console.log(`   📦 Products: ${data.products.length}`);
      } else {
        console.log(`❌ ${test.name}: FAILED (${response.status})`);
        console.log(`   📄 Response: ${text.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERROR - ${error.message}`);
    }
  }
  
  console.log('\n🎯 DIAGNOSIS COMPLETE');
})();