const https = require('https');

// Test client-side filtering performance like our actual Step 2 component
function testClientFiltering() {
  const startTime = Date.now();
  
  const options = {
    hostname: 'staffportal.replit.app',
    port: 443,
    path: '/api/public/lenders',
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      const fetchTime = Date.now() - startTime;
      
      try {
        const response = JSON.parse(data);
        const products = response.products || [];
        
        console.log('🔍 CLIENT-SIDE FILTERING PERFORMANCE TEST');
        console.log('==========================================');
        console.log(`📥 Fetch time: ${fetchTime}ms`);
        console.log(`📊 Total products: ${products.length}`);
        console.log('');
        
        // Test filtering scenarios like our actual Step 2 component
        const filterStartTime = Date.now();
        
        // Scenario 1: US Term Loan $250K
        const scenario1 = products.filter(product => {
          const geography = product.geography || ['US'];
          const minAmount = parseFloat(product.amountRange?.min || product.minAmount || 0);
          const maxAmount = parseFloat(product.amountRange?.max || product.maxAmount || 0);
          const category = product.category || product.product_type || '';
          
          return geography.includes('US') && 
                 250000 >= minAmount && 
                 250000 <= maxAmount &&
                 category.toLowerCase().includes('term');
        });
        
        // Scenario 2: Canada Equipment $100K
        const scenario2 = products.filter(product => {
          const geography = product.geography || ['US'];
          const minAmount = parseFloat(product.amountRange?.min || product.minAmount || 0);
          const maxAmount = parseFloat(product.amountRange?.max || product.maxAmount || 0);
          const category = product.category || product.product_type || '';
          
          return geography.includes('CA') && 
                 100000 >= minAmount && 
                 100000 <= maxAmount &&
                 category.toLowerCase().includes('equipment');
        });
        
        // Scenario 3: US Line of Credit $50K
        const scenario3 = products.filter(product => {
          const geography = product.geography || ['US'];
          const minAmount = parseFloat(product.amountRange?.min || product.minAmount || 0);
          const maxAmount = parseFloat(product.amountRange?.max || product.maxAmount || 0);
          const category = product.category || product.product_type || '';
          
          return geography.includes('US') && 
                 50000 >= minAmount && 
                 50000 <= maxAmount &&
                 (category.toLowerCase().includes('line') || category.toLowerCase().includes('credit'));
        });
        
        const filterTime = Date.now() - filterStartTime;
        
        console.log('🎯 FILTERING RESULTS:');
        console.log(`⏱️  Filter time: ${filterTime}ms`);
        console.log(`🇺🇸 US Term Loan $250K: ${scenario1.length} matches`);
        console.log(`🇨🇦 Canada Equipment $100K: ${scenario2.length} matches`);
        console.log(`🇺🇸 US Line of Credit $50K: ${scenario3.length} matches`);
        console.log('');
        
        const totalTime = Date.now() - startTime;
        console.log(`⚡ TOTAL TIME: ${totalTime}ms (${fetchTime}ms fetch + ${filterTime}ms filter)`);
        console.log('');
        
        // Performance evaluation
        if (totalTime < 50) {
          console.log('🚀 EXCELLENT: Sub-50ms total time');
        } else if (totalTime < 150) {
          console.log('✅ GOOD: Under 150ms target');
        } else {
          console.log('⚠️  SLOW: Exceeds 150ms target');
        }
        
        console.log('');
        console.log('📋 SAMPLE PRODUCTS:');
        console.log('-------------------');
        
        // Show a few products from each scenario
        if (scenario1.length > 0) {
          console.log('US Term Loan matches:');
          scenario1.slice(0, 2).forEach(p => {
            console.log(`  • ${p.productName || p.name} (${p.lenderName}) - ${p.geography?.join(', ')}`);
          });
        }
        
        if (scenario2.length > 0) {
          console.log('Canada Equipment matches:');
          scenario2.slice(0, 2).forEach(p => {
            console.log(`  • ${p.productName || p.name} (${p.lenderName}) - ${p.geography?.join(', ')}`);
          });
        }
        
        if (scenario3.length > 0) {
          console.log('US Line of Credit matches:');
          scenario3.slice(0, 2).forEach(p => {
            console.log(`  • ${p.productName || p.name} (${p.lenderName}) - ${p.geography?.join(', ')}`);
          });
        }
        
      } catch (error) {
        console.log('❌ JSON Parse Error:', error.message);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Request Error:', error.message);
  });

  req.end();
}

testClientFiltering();