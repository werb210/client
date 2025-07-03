const https = require('https');

// Test the three filter scenarios from the checklist
const testCases = [
  {
    name: 'US Term Loan $250K',
    url: '/api/public/lenders?country=US&amount=250000&category=term_loan',
    expected: 'Should return term loan products for US market'
  },
  {
    name: 'Canada Equipment $100K',
    url: '/api/public/lenders?country=CA&amount=100000&category=equipment_financing',
    expected: 'Should return equipment financing for Canada'
  },
  {
    name: 'US Line of Credit $50K',
    url: '/api/public/lenders?country=US&amount=50000&category=line_of_credit',
    expected: 'Should return line of credit products'
  }
];

function testEndpoint(testCase) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const options = {
      hostname: 'staffportal.replit.app',
      port: 443,
      path: testCase.url,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const latency = endTime - startTime;
        
        try {
          const response = JSON.parse(data);
          const productCount = response.products ? response.products.length : 0;
          
          resolve({
            testCase: testCase.name,
            latency: latency,
            productCount: productCount,
            success: response.success,
            status: res.statusCode
          });
        } catch (error) {
          reject({
            testCase: testCase.name,
            error: error.message,
            rawData: data.substring(0, 200)
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        testCase: testCase.name,
        error: error.message
      });
    });

    req.end();
  });
}

async function runPerformanceTest() {
  console.log('🚀 LENDER DATABASE PERFORMANCE TEST');
  console.log('=====================================');
  console.log('Testing 3 core filter scenarios from Step 1 → Step 2 workflow\n');
  
  for (const testCase of testCases) {
    try {
      console.log(`Testing: ${testCase.name}`);
      console.log(`URL: ${testCase.url}`);
      
      const result = await testEndpoint(testCase);
      
      console.log(`✅ Status: ${result.status}`);
      console.log(`⏱️  Latency: ${result.latency}ms`);
      console.log(`📊 Products: ${result.productCount}`);
      console.log(`Expected: ${testCase.expected}`);
      
      // Performance evaluation
      if (result.latency < 50) {
        console.log('🚀 EXCELLENT: Sub-50ms response time');
      } else if (result.latency < 150) {
        console.log('✅ GOOD: Under 150ms target');
      } else {
        console.log('⚠️  SLOW: Exceeds 150ms target');
      }
      
      console.log('---');
    } catch (error) {
      console.log(`❌ FAILED: ${error.testCase}`);
      console.log(`Error: ${error.error}`);
      if (error.rawData) {
        console.log(`Raw: ${error.rawData}`);
      }
      console.log('---');
    }
  }
  
  console.log('\n🎯 PERFORMANCE TARGETS:');
  console.log('• Cold start: < 150ms');
  console.log('• Warm requests: < 50ms');
  console.log('• Product filtering: Should return relevant matches');
  console.log('• Geographic coverage: US + Canada support');
}

runPerformanceTest().catch(console.error);