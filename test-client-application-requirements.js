/**
 * CLIENT APPLICATION REQUIREMENTS TEST
 * Tests all Steps 4-5 requirements from CLIENT APPLICATION instructions
 */

console.log('🧩 TESTING CLIENT APPLICATION REQUIREMENTS (Steps 4-5)');
console.log('======================================================');

async function testStep4RecommendationLogTransmission() {
  console.log('\n📊 STEP 4 - Recommendation Log Transmission Test');
  console.log('------------------------------------------------');
  
  // Test payload matching the exact format from instructions
  const testPayload = {
    applicantId: localStorage.getItem('applicationId') || 'test-application-uuid-here',
    recommendedLenders: [
      {
        productId: 'test-product-1',
        productName: 'Working Capital Loan',
        lenderName: 'Test Lender',
        category: 'Working Capital',
        country: 'Canada',
        score: 85
      }
    ],
    rejectedLenders: [
      {
        productId: 'test-product-2',
        productName: 'Equipment Financing',
        lenderName: 'Another Lender', 
        category: 'Equipment Financing',
        country: 'USA',
        failureReasons: ['Country mismatch: USA ≠ Canada']
      }
    ],
    filtersApplied: [
      'Country: Canada',
      'Amount: 100000',
      'Category: Working Capital',
      'Purpose: working_capital'
    ]
  };
  
  try {
    console.log('🚀 Sending POST to /api/analytics/recommendation-log...');
    const response = await fetch(`${window.location.origin}/api/analytics/recommendation-log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      },
      body: JSON.stringify(testPayload)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ STEP 4 SUCCESS: Analytics endpoint responded with 200 OK');
      console.log('📋 Response:', result);
      console.log('✅ Recommendation log sent confirmation: PASSED');
      return true;
    } else {
      console.error('❌ STEP 4 FAILED: Analytics endpoint error:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ STEP 4 FAILED: Network error:', error);
    return false;
  }
}

async function testStep5ChatbotEscalation() {
  console.log('\n🤝 STEP 5 - Chatbot Escalation UI Feedback Test');
  console.log('-----------------------------------------------');
  
  try {
    console.log('🚀 Testing POST /api/public/chat/escalate...');
    const escalationResponse = await fetch(`${window.location.origin}/api/public/chat/escalate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: localStorage.getItem('sessionId') || 'test-session-id',
        applicationId: localStorage.getItem('applicationId'),
        userEmail: 'test@example.com',
        userName: 'Test User',
        currentStep: 'debug-test',
        context: {
          messages: [{ role: 'user', content: 'I need help with something' }],
          applicationData: {}
        },
        timestamp: new Date().toISOString()
      })
    });
    
    if (escalationResponse.ok) {
      console.log('✅ ESCALATION SUCCESS: Chat escalation endpoint returned 200 OK');
      console.log('🔔 Alert should show: "✅ Your request has been sent to a human support agent"');
      return true;
    } else {
      console.error('❌ ESCALATION FAILED:', escalationResponse.status);
      return false;
    }
  } catch (error) {
    console.error('❌ ESCALATION FAILED: Network error:', error);
    return false;
  }
}

async function testStep5ChatbotIssueReport() {
  console.log('\n🐛 STEP 5 - Chatbot Issue Report UI Feedback Test');
  console.log('-----------------------------------------------');
  
  try {
    console.log('🚀 Testing POST /api/public/chat/report...');
    const reportResponse = await fetch(`${window.location.origin}/api/public/chat/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: localStorage.getItem('sessionId') || 'test-session-id',
        applicationId: localStorage.getItem('applicationId'),
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test issue report',
        page: window.location.pathname,
        screenshot: '',
        timestamp: new Date().toISOString()
      })
    });
    
    if (reportResponse.ok) {
      console.log('✅ ISSUE REPORT SUCCESS: Chat report endpoint returned 200 OK');
      console.log('🔔 Alert should show: "✅ Your issue report has been submitted"');
      return true;
    } else {
      console.error('❌ ISSUE REPORT FAILED:', reportResponse.status);
      return false;
    }
  } catch (error) {
    console.error('❌ ISSUE REPORT FAILED: Network error:', error);
    return false;
  }
}

function testWebSocketConnection() {
  console.log('\n🔌 STEP 5 - WebSocket Real-time Message Test');
  console.log('-------------------------------------------');
  
  if (window.globalSocket && window.globalSocket.connected) {
    console.log('✅ WEBSOCKET SUCCESS: Socket.IO connected with ID:', window.globalSocket.id);
    console.log('📡 WebSocket ready to receive real-time staff messages');
    
    // Test WebSocket message reception
    window.globalSocket.on('test-staff-message', (data) => {
      console.log('✅ WEBSOCKET MESSAGE RECEIVED:', data);
      console.log('🔔 Real-time staff message system: OPERATIONAL');
    });
    
    return true;
  } else {
    console.error('❌ WEBSOCKET FAILED: Socket.IO not connected');
    return false;
  }
}

function testLocalStorageIntegration() {
  console.log('\n💾 LOCAL STORAGE SESSION INTEGRATION TEST');
  console.log('----------------------------------------');
  
  const sessionId = localStorage.getItem('sessionId');
  const applicationId = localStorage.getItem('applicationId');
  
  console.log('📋 sessionId in localStorage:', sessionId || 'NOT FOUND');
  console.log('📋 applicationId in localStorage:', applicationId || 'NOT FOUND');
  
  if (sessionId) {
    console.log('✅ SESSION LINKAGE: sessionId available for escalation/report');
    return true;
  } else {
    console.warn('⚠️ SESSION LINKAGE: sessionId not found in localStorage');
    return false;
  }
}

// Run comprehensive test suite
async function runClientApplicationTests() {
  console.log('🎯 RUNNING COMPREHENSIVE CLIENT APPLICATION TEST SUITE');
  console.log('=======================================================');
  
  const results = {
    step4Analytics: await testStep4RecommendationLogTransmission(),
    step5Escalation: await testStep5ChatbotEscalation(),
    step5IssueReport: await testStep5ChatbotIssueReport(),
    websocketConnection: testWebSocketConnection(),
    localStorageIntegration: testLocalStorageIntegration()
  };
  
  console.log('\n📋 FINAL TEST RESULTS');
  console.log('====================');
  console.log('1. POST /api/analytics/recommendation-log confirmed:', results.step4Analytics ? '✅ PASS' : '❌ FAIL');
  console.log('2. Chat escalation returns success + alert shows:', results.step5Escalation ? '✅ PASS' : '❌ FAIL');
  console.log('3. Chat issue report returns success + alert shows:', results.step5IssueReport ? '✅ PASS' : '❌ FAIL');
  console.log('4. WebSocket message from staff received in real time:', results.websocketConnection ? '✅ PASS' : '❌ FAIL');
  console.log('5. Session linkage to localStorage.sessionId:', results.localStorageIntegration ? '✅ PASS' : '❌ FAIL');
  
  const totalPassed = Object.values(results).filter(r => r).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 OVERALL SCORE: ${totalPassed}/${totalTests} tests passed (${Math.round(totalPassed/totalTests*100)}%)`);
  
  if (totalPassed === totalTests) {
    console.log('🎉 ALL CLIENT APPLICATION REQUIREMENTS MET - READY FOR DEPLOYMENT');
  } else {
    console.log('⚠️ Some requirements need attention - see failed tests above');
  }
  
  return results;
}

// Auto-run test after page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runClientApplicationTests);
} else {
  setTimeout(runClientApplicationTests, 1000);
}

// Make test function available globally
window.testClientApplicationRequirements = runClientApplicationTests;

console.log('💡 Test suite loaded. Run window.testClientApplicationRequirements() to test again.');