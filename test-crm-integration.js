// CRM Integration Test Suite
// Tests all 4 CRM contact creation automation tasks

console.log('🧪 CRM Integration Test Suite Starting...');

// Test 1: Application Submission CRM Contact Creation
async function testApplicationSubmissionCRM() {
  console.log('\n=== TEST 1: Application Submission CRM ===');
  
  const testApplicationData = {
    step4: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@test.com',
      phone: '+1-555-123-4567',
      applicationId: 'test-app-12345'
    }
  };
  
  try {
    const response = await fetch('/api/public/crm/contacts/auto-create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
      },
      body: JSON.stringify({
        firstName: testApplicationData.step4.firstName,
        lastName: testApplicationData.step4.lastName,
        email: testApplicationData.step4.email,
        phone: testApplicationData.step4.phone,
        source: 'application',
        applicationId: testApplicationData.step4.applicationId,
        timestamp: new Date().toISOString()
      })
    });
    
    console.log('✅ Application CRM Response:', response.status, response.statusText);
    if (response.ok) {
      const result = await response.json();
      console.log('📋 Application CRM Result:', result);
    }
  } catch (error) {
    console.error('❌ Application CRM Test Failed:', error);
  }
}

// Test 2: Chatbot Contact Collection CRM
async function testChatbotContactCRM() {
  console.log('\n=== TEST 2: Chatbot Contact Collection CRM ===');
  
  const testContactData = {
    sessionId: 'test-session-' + Date.now(),
    name: 'Jane Smith',
    email: 'jane.smith@test.com'
  };
  
  try {
    const response = await fetch('/api/chat/log-contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testContactData)
    });
    
    console.log('✅ Chatbot Contact CRM Response:', response.status, response.statusText);
    if (response.ok) {
      const result = await response.json();
      console.log('📋 Chatbot Contact CRM Result:', result);
    }
  } catch (error) {
    console.error('❌ Chatbot Contact CRM Test Failed:', error);
  }
}

// Test 3: Chat Escalation CRM (Socket.IO)
async function testChatEscalationCRM() {
  console.log('\n=== TEST 3: Chat Escalation CRM ===');
  
  if (typeof io !== 'undefined') {
    const socket = io();
    
    const escalationData = {
      sessionId: 'test-escalation-' + Date.now(),
      name: 'Bob Johnson',
      email: 'bob.johnson@test.com',
      currentPage: '/apply/step-3',
      timestamp: new Date().toISOString()
    };
    
    socket.emit('request_human', escalationData);
    console.log('✅ Chat Escalation Socket Event Emitted:', escalationData);
    
    // Also test HTTP fallback
    try {
      const response = await fetch('/api/chat/request-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(escalationData)
      });
      
      console.log('✅ Chat Escalation HTTP Response:', response.status, response.statusText);
    } catch (error) {
      console.error('❌ Chat Escalation HTTP Test Failed:', error);
    }
  } else {
    console.log('⚠️ Socket.IO not available for escalation test');
  }
}

// Test 4: Issue Reporting CRM
async function testIssueReportingCRM() {
  console.log('\n=== TEST 4: Issue Reporting CRM ===');
  
  const testIssueData = {
    name: 'Alice Brown',
    email: 'alice.brown@test.com',
    message: 'Test issue report - CRM integration verification',
    page: window.location.pathname,
    screenshot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // 1px test image
    timestamp: new Date().toISOString()
  };
  
  try {
    const response = await fetch('/api/ai/report-issue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testIssueData)
    });
    
    console.log('✅ Issue Reporting CRM Response:', response.status, response.statusText);
    if (response.ok) {
      const result = await response.json();
      console.log('📋 Issue Reporting CRM Result:', result);
    }
  } catch (error) {
    console.error('❌ Issue Reporting CRM Test Failed:', error);
  }
}

// Test 5: Verify Staff Backend Connection
async function testStaffBackendConnection() {
  console.log('\n=== TEST 5: Staff Backend Connection ===');
  
  try {
    const response = await fetch('/api/system-health');
    console.log('✅ System Health Response:', response.status, response.statusText);
    
    if (response.ok) {
      const result = await response.json();
      console.log('📋 System Health Result:', result);
    }
  } catch (error) {
    console.error('❌ Staff Backend Connection Test Failed:', error);
  }
}

// Run all tests
async function runAllCRMTests() {
  console.log('🚀 Starting Comprehensive CRM Integration Tests...\n');
  
  await testApplicationSubmissionCRM();
  await testChatbotContactCRM();
  await testChatEscalationCRM();
  await testIssueReportingCRM();
  await testStaffBackendConnection();
  
  console.log('\n🏁 CRM Integration Test Suite Complete!');
  console.log('📊 Check server logs for CRM contact creation confirmations');
  console.log('📊 Check staff backend for new contacts in crm_contacts table');
}

// Make functions available globally
window.testApplicationSubmissionCRM = testApplicationSubmissionCRM;
window.testChatbotContactCRM = testChatbotContactCRM;
window.testChatEscalationCRM = testChatEscalationCRM;
window.testIssueReportingCRM = testIssueReportingCRM;
window.testStaffBackendConnection = testStaffBackendConnection;
window.runAllCRMTests = runAllCRMTests;

console.log('📋 CRM Test Functions Available:');
console.log('- window.runAllCRMTests() - Run complete test suite');
console.log('- window.testApplicationSubmissionCRM() - Test Task 1');
console.log('- window.testChatbotContactCRM() - Test Task 2');
console.log('- window.testChatEscalationCRM() - Test Task 3');
console.log('- window.testIssueReportingCRM() - Test Task 4');
console.log('- window.testStaffBackendConnection() - Test backend connectivity');