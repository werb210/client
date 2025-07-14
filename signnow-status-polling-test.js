/**
 * SIGNNOW STATUS POLLING TEST
 * Tests the corrected status polling logic for "user.document.fieldinvite.signed"
 * Date: July 14, 2025
 */

console.log('📡 SIGNNOW STATUS POLLING TEST - CORRECTED STATUS CHECK');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

function testSignNowStatusPolling() {
  const testCases = [
    {
      name: 'Invite sent (should NOT redirect)',
      response: { status: 'invite_sent' },
      expected: false
    },
    {
      name: 'Document signed - main path (should redirect)',
      response: { status: 'user.document.fieldinvite.signed' },
      expected: true
    },
    {
      name: 'Document signed - signing_status field (should redirect)',
      response: { signing_status: 'invite_signed' },
      expected: true
    },
    {
      name: 'Document signed - nested path (should redirect)',
      response: { user: { document: { fieldinvite: 'signed' } } },
      expected: true
    },
    {
      name: 'Document signed - both fields (should redirect)',
      response: { status: 'user.document.fieldinvite.signed', signing_status: 'invite_signed' },
      expected: true
    },
    {
      name: 'Other status (should NOT redirect)',
      response: { status: 'processing' },
      expected: false
    },
    {
      name: 'No status field (should NOT redirect)',
      response: {},
      expected: false
    },
    {
      name: 'Null response (should NOT redirect)',
      response: null,
      expected: false
    }
  ];

  console.log('\n📋 Testing Enhanced Status Polling Logic:');
  console.log('Expected statuses for redirect:');
  console.log('  - status === "user.document.fieldinvite.signed"');
  console.log('  - signing_status === "invite_signed"');
  console.log('  - user.document.fieldinvite === "signed"');
  console.log('────────────────────────────────────────────────────────────────────────────');

  let passed = 0;
  let failed = 0;

  testCases.forEach(({ name, response, expected }) => {
    // Test the enhanced polling logic from Step6_SignNowIntegration.tsx
    const signingStatus = response?.signing_status || response?.status;
    const isDocumentSigned = (
      response?.status === "user.document.fieldinvite.signed" ||
      response?.signing_status === "invite_signed" ||
      response?.user?.document?.fieldinvite === "signed" ||
      signingStatus === "invite_signed"
    );
    
    if (isDocumentSigned === expected) {
      console.log(`✅ ${name}: ${isDocumentSigned ? 'REDIRECTS' : 'STAYS'} (correct)`);
      passed++;
    } else {
      console.log(`❌ ${name}: Expected ${expected}, got ${isDocumentSigned}`);
      failed++;
    }
  });

  console.log('\n📊 Test Results:');
  console.log(`✅ Tests Passed: ${passed}/${testCases.length}`);
  console.log(`❌ Tests Failed: ${failed}/${testCases.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Status polling logic is correct.');
  }

  // Test current application status
  console.log('\n🔍 Current Application Status:');
  const applicationId = localStorage.getItem('applicationId');
  
  if (applicationId) {
    console.log(`Application ID: ${applicationId}`);
    console.log('Polling endpoint: /api/public/signnow/status/' + applicationId);
    
    // Test the actual polling endpoint
    console.log('\n📡 Testing actual polling endpoint...');
    fetch(`/api/public/signnow/status/${applicationId}`)
      .then(res => res.json())
      .then(data => {
        console.log('📄 Current server response:', data);
        console.log('📄 Status value:', data?.status);
        
        const signingStatus = data?.signing_status || data?.status;
        const isDocumentSigned = (
          data?.status === "user.document.fieldinvite.signed" ||
          data?.signing_status === "invite_signed" ||
          data?.user?.document?.fieldinvite === "signed" ||
          signingStatus === "invite_signed"
        );
        
        if (isDocumentSigned) {
          console.log('🎉 Document is signed! Should redirect to Step 7');
          console.log('📋 Matched signing condition:', {
            status: data?.status,
            signing_status: data?.signing_status,
            nested_path: data?.user?.document?.fieldinvite
          });
        } else if (data?.status === "invite_sent") {
          console.log('📤 Invite sent but not signed yet');
        } else {
          console.log('⏳ Waiting for signature...');
        }
      })
      .catch(err => {
        console.log('❌ Polling endpoint error:', err.message);
      });
  } else {
    console.log('❌ No application ID found');
  }

  return { passed, failed, total: testCases.length };
}

// Run the test
const results = testSignNowStatusPolling();

// Make test available globally
window.signNowStatusTest = {
  run: testSignNowStatusPolling,
  results: results
};

console.log('\n💡 To run test again: window.signNowStatusTest.run()');
console.log('💡 To check current status: fetch("/api/public/signnow/status/" + localStorage.getItem("applicationId")).then(r => r.json()).then(console.log)');