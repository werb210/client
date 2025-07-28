// Test duplicate email handling system

console.log('🧪 Testing duplicate email handling...');

async function testDuplicateHandling() {
  try {
    const testPayload = {
      step1: {
        requestedAmount: 45000,
        use_of_funds: "capital",
        businessLocation: "CA",
        selectedCategory: "Working Capital"
      },
      step3: {
        operatingName: "A1",
        legalName: "A1", 
        businessName: "A1",
        businessPhone: "+18888888888"
      },
      step4: {
        applicantFirstName: "Todd",
        applicantLastName: "Werboweski", 
        applicantEmail: "todd@werboweski.com", // This email already exists
        applicantPhone: "+15878881837",
        email: "todd@werboweski.com"
      }
    };
    
    console.log('📤 Testing with duplicate email payload...');
    
    const response = await fetch('/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 409) {
      const result = await response.json();
      console.log('✅ Duplicate handling working!');
      console.log('📋 Duplicate Response:', result);
      
      if (result.applicationId) {
        console.log(`🔑 Application ID extracted: ${result.applicationId}`);
        console.log('✅ Ready to continue workflow to Step 5');
        return result.applicationId;
      } else {
        console.log('⚠️ No applicationId in duplicate response');
        return false;
      }
    } else {
      const result = await response.json();
      console.log('📋 Unexpected response:', result);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Make function available globally
window.testDuplicateHandling = testDuplicateHandling;

console.log('🔧 Run window.testDuplicateHandling() to test duplicate email handling');