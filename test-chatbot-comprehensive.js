// test-chatbot-comprehensive.js - Comprehensive chatbot functionality test
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function runChatbotTests() {
  console.log('🤖 COMPREHENSIVE CHATBOT FUNCTIONALITY TEST');
  console.log('============================================');

  let testResults = {
    csrfProtection: 0,
    leadCapture: 0,
    staffHandoff: 0,
    aiChat: 0,
    security: 0,
    total: 0
  };

  console.log('\n🔒 1. CSRF PROTECTION TESTS');
  console.log('---------------------------');

  try {
    // Test 1a: CSRF token issuance
    console.log('1a. Testing CSRF token issuance...');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const csrfToken = healthRes.headers.get('x-csrf-token');
    
    if (csrfToken) {
      console.log('   ✅ CSRF token issued successfully');
      testResults.csrfProtection += 1;
    } else {
      console.log('   ❌ CSRF token not issued');
    }

    // Test 1b: CSRF protection blocking
    console.log('1b. Testing CSRF protection blocking...');
    const blockedRes = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        consent: true
      })
    });

    if (blockedRes.status === 403) {
      console.log('   ✅ CSRF protection blocking unauthorized requests');
      testResults.csrfProtection += 1;
    } else {
      console.log(`   ❌ CSRF protection not working (status: ${blockedRes.status})`);
    }

    console.log('\n👤 2. LEAD CAPTURE TESTS');
    console.log('------------------------');

    // Test 2a: Valid lead submission
    console.log('2a. Testing valid lead submission...');
    const leadRes = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken
      },
      body: JSON.stringify({
        name: 'Jane Smith',
        email: 'jane@acme.com',
        consent: true,
        source: 'chat',
        page: '/test',
        language: 'en'
      })
    });

    if (leadRes.ok) {
      const leadResult = await leadRes.json();
      console.log('   ✅ Lead captured successfully');
      console.log(`   📝 Response:`, leadResult.ok ? 'Lead processed' : 'Lead queued');
      testResults.leadCapture += 2;
    } else {
      console.log(`   ❌ Lead capture failed (status: ${leadRes.status})`);
    }

    // Test 2b: Validation error handling
    console.log('2b. Testing validation error handling...');
    const invalidLeadRes = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken
      },
      body: JSON.stringify({
        name: 'Test',
        email: 'invalid-email',
        consent: true
      })
    });

    if (invalidLeadRes.status === 422) {
      console.log('   ✅ Validation errors handled correctly');
      testResults.leadCapture += 1;
    } else {
      console.log(`   ❌ Validation not working (status: ${invalidLeadRes.status})`);
    }

    // Test 2c: Consent requirement
    console.log('2c. Testing consent requirement...');
    const noConsentRes = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        consent: false
      })
    });

    if (noConsentRes.status === 400) {
      console.log('   ✅ Consent requirement enforced');
      testResults.leadCapture += 1;
    } else {
      console.log(`   ❌ Consent requirement not enforced (status: ${noConsentRes.status})`);
    }

    console.log('\n🤝 3. STAFF HANDOFF TESTS');
    console.log('-------------------------');

    // Test 3a: Staff handoff request
    console.log('3a. Testing staff handoff request...');
    const handoffRes = await fetch(`${BASE_URL}/api/chat/request-staff`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test_session_123',
        name: 'Jane Smith',
        email: 'jane@acme.com',
        currentPage: '/test'
      })
    });

    if (handoffRes.status === 503 || handoffRes.ok) {
      // Either configured and working, or properly handling missing config
      const handoffResult = await handoffRes.json();
      console.log('   ✅ Staff handoff endpoint responding correctly');
      testResults.staffHandoff += 1;
    } else {
      console.log(`   ❌ Staff handoff endpoint error (status: ${handoffRes.status})`);
    }

    // Test 3b: User message logging
    console.log('3b. Testing user message logging...');
    const messageRes = await fetch(`${BASE_URL}/api/chat/user-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jane@acme.com',
        name: 'Jane Smith',
        text: 'I need help with financing',
        source: 'chat',
        page: '/test'
      })
    });

    if (messageRes.ok) {
      console.log('   ✅ User message logging working');
      testResults.staffHandoff += 1;
    } else {
      console.log(`   ❌ User message logging failed (status: ${messageRes.status})`);
    }

    console.log('\n🤖 4. AI CHAT TESTS');
    console.log('-------------------');

    // Test 4a: AI message processing
    console.log('4a. Testing AI message processing...');
    const aiRes = await fetch(`${BASE_URL}/api/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test_session_ai',
        message: 'Do you offer equipment financing?',
        language: 'en',
        context: {
          name: 'Jane Smith',
          email: 'jane@acme.com'
        }
      })
    });

    if (aiRes.ok) {
      const aiResult = await aiRes.json();
      console.log('   ✅ AI chat processing working');
      if (aiResult.recommendations) {
        console.log('   ✅ Lender recommendations included');
        testResults.aiChat += 2;
      } else {
        testResults.aiChat += 1;
      }
    } else {
      console.log(`   ❌ AI chat processing failed (status: ${aiRes.status})`);
    }

    console.log('\n🛡️ 5. SECURITY TESTS');
    console.log('--------------------');

    // Test 5a: PII detection (this would be tested in the frontend)
    console.log('5a. Security headers verification...');
    const securityRes = await fetch(`${BASE_URL}/api/health`);
    const headers = Object.fromEntries(securityRes.headers.entries());
    
    let securityCount = 0;
    if (headers['x-content-type-options']) {
      console.log('   ✅ X-Content-Type-Options header present');
      securityCount++;
    }
    if (headers['content-security-policy']) {
      console.log('   ✅ Content-Security-Policy header present');
      securityCount++;
    }
    
    testResults.security = securityCount;

    // Test 5b: File upload security (placeholder)
    console.log('5b. File upload security (endpoint not implemented yet)');

    console.log('\n📊 6. QUEUE STATUS');
    console.log('------------------');

    const queueRes = await fetch(`${BASE_URL}/api/queue-status`);
    if (queueRes.ok) {
      const queueData = await queueRes.json();
      console.log(`   📋 Lead queue length: ${queueData.queueLength}`);
      console.log(`   🔄 Queue processing: ${queueData.isProcessing ? 'Active' : 'Idle'}`);
    }

  } catch (error) {
    console.error('❌ Test execution error:', error);
  }

  // Calculate final results
  testResults.total = Object.values(testResults).reduce((sum, score) => sum + score, 0) - testResults.total;
  const maxScore = 12; // Adjust based on total possible points
  const percentage = Math.round((testResults.total / maxScore) * 100);

  console.log('\n📊 CHATBOT TEST RESULTS');
  console.log('=======================');
  console.log(`🔒 CSRF Protection: ${testResults.csrfProtection}/2`);
  console.log(`👤 Lead Capture: ${testResults.leadCapture}/4`);
  console.log(`🤝 Staff Handoff: ${testResults.staffHandoff}/2`);
  console.log(`🤖 AI Chat: ${testResults.aiChat}/2`);
  console.log(`🛡️ Security: ${testResults.security}/2`);
  console.log(`📈 Total Score: ${testResults.total}/${maxScore} (${percentage}%)`);

  console.log('\n🎯 CHATBOT FUNCTIONALITY VERDICT');
  console.log('================================');

  if (percentage >= 90) {
    console.log('✅ EXCELLENT - Chatbot fully functional');
    console.log('🎉 All core features working as expected');
  } else if (percentage >= 75) {
    console.log('✅ GOOD - Chatbot mostly functional');
    console.log('⚠️  Minor issues that don\'t affect core functionality');
  } else if (percentage >= 60) {
    console.log('⚠️  ACCEPTABLE - Core chatbot features working');
    console.log('🔧 Some features need attention');
  } else {
    console.log('❌ NEEDS WORK - Critical chatbot issues');
    console.log('🛠️  Address major issues before deployment');
  }

  console.log(`\n⏰ Test completed: ${new Date().toISOString()}`);
}

// Run the tests
runChatbotTests().catch(error => {
  console.error('❌ Chatbot test suite failed:', error);
  process.exit(1);
});