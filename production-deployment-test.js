// production-deployment-test.js - Live production deployment verification
import fetch from 'node-fetch';

console.log('🚀 PRODUCTION DEPLOYMENT VERIFICATION');
console.log('====================================');

let testResults = { security: 0, performance: 0, functionality: 0, total: 0 };

async function runDeploymentTests() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('\n🔒 LIVE SECURITY TESTS');
  console.log('----------------------');
  
  try {
    // Test 1: CSRF Protection
    console.log('1. Testing CSRF Protection...');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const csrfToken = healthRes.headers.get('x-csrf-token');
    
    if (csrfToken) {
      console.log('   ✅ CSRF Token Issued');
      testResults.security += 1;
    } else {
      console.log('   ❌ CSRF Token Missing');
    }
    
    // Test CSRF blocking
    const blockedRes = await fetch(`${baseUrl}/api/public/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' })
    });
    
    if (blockedRes.status === 403 || blockedRes.status === 400) {
      console.log('   ✅ Request Blocking Active');
      testResults.security += 1;
    } else {
      console.log(`   ❌ Blocking Failed (${blockedRes.status})`);
    }
    
    // Test 2: Security Headers
    console.log('2. Testing Security Headers...');
    const headers = Object.fromEntries(healthRes.headers.entries());
    
    const requiredHeaders = ['x-content-type-options', 'content-security-policy'];
    let headerCount = 0;
    requiredHeaders.forEach(header => {
      if (headers[header]) {
        headerCount++;
        console.log(`   ✅ ${header}: Present`);
      } else {
        console.log(`   ❌ ${header}: Missing`);
      }
    });
    
    testResults.security += headerCount;
    
    // Test 3: Performance
    console.log('\n⚡ PERFORMANCE TESTS');
    console.log('-------------------');
    
    const start = Date.now();
    await fetch(`${baseUrl}/api/health`);
    const responseTime = Date.now() - start;
    
    if (responseTime < 200) {
      console.log(`✅ Fast Response: ${responseTime}ms`);
      testResults.performance += 2;
    } else {
      console.log(`⚠️  Response Time: ${responseTime}ms`);
      testResults.performance += 1;
    }
    
    // Test 4: Functionality
    console.log('\n🔧 FUNCTIONALITY TESTS');
    console.log('----------------------');
    
    const endpoints = ['/api/health', '/api/public/lenders'];
    
    for (const endpoint of endpoints) {
      try {
        const res = await fetch(`${baseUrl}${endpoint}`);
        if (res.ok) {
          console.log(`✅ ${endpoint}: Working`);
          testResults.functionality += 1;
        } else {
          console.log(`❌ ${endpoint}: Failed (${res.status})`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint}: Error`);
      }
    }
    
  } catch (error) {
    console.log('❌ Tests failed:', error.message);
  }
  
  // Calculate results
  testResults.total = testResults.security + testResults.performance + testResults.functionality;
  const maxScore = 8;
  const percentage = Math.round((testResults.total / maxScore) * 100);
  
  console.log('\n📊 DEPLOYMENT TEST RESULTS');
  console.log('==========================');
  console.log(`🔒 Security Score: ${testResults.security}/4`);
  console.log(`⚡ Performance Score: ${testResults.performance}/2`);
  console.log(`🔧 Functionality Score: ${testResults.functionality}/2`);
  console.log(`📈 Total Score: ${testResults.total}/${maxScore} (${percentage}%)`);
  
  console.log('\n🎯 DEPLOYMENT VERDICT');
  console.log('====================');
  
  if (percentage >= 90) {
    console.log('✅ APPROVED FOR PRODUCTION DEPLOYMENT');
    console.log('🚀 All systems ready for live traffic');
  } else if (percentage >= 75) {
    console.log('⚠️  CONDITIONAL APPROVAL');
    console.log('🔍 Deploy with monitoring');
  } else {
    console.log('❌ DEPLOYMENT NOT RECOMMENDED');
    console.log('🛠️  Fix issues before deployment');
  }
}

runDeploymentTests().catch(console.error);
