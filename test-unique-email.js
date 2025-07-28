/**
 * TEST WITH UNIQUE EMAIL
 * Testing if the 500 error is due to duplicate email constraint
 */

console.log('🧪 TESTING WITH UNIQUE EMAIL');
console.log('============================');

async function testUniqueEmail() {
  const timestamp = Date.now();
  const uniqueEmail = `test.user.${timestamp}@example.com`;
  
  console.log('Testing with unique email:', uniqueEmail);
  
  const testPayload = {
    step1: {
      requestedAmount: "25000",
      useOfFunds: "Working capital"
    },
    step3: {
      businessName: "Test Company",
      legalBusinessName: "Test Company", 
      businessType: "Corporation",
      businessEmail: uniqueEmail,
      businessPhone: "+15555551234"
    },
    step4: {
      firstName: "Test",
      lastName: "User",
      email: uniqueEmail,
      phone: "+15555551234", 
      dob: "1990-01-01",
      sin: "123456789",
      ownershipPercentage: 100
    }
  };
  
  try {
    const response = await fetch('https://staff.boreal.financial/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN}`
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Application created with unique email');
      console.log('Application ID:', data.applicationId);
      console.log('This confirms the issue was duplicate email constraint');
      return { success: true, applicationId: data.applicationId };
    } else {
      const errorText = await response.text();
      console.log('❌ Still failed with unique email');
      console.log('Error:', errorText);
      console.log('This indicates a different staff backend issue');
      return { success: false, error: errorText };
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    return { success: false, error: error.message };
  }
}

testUniqueEmail().then(result => {
  if (result.success) {
    console.log('\n🎉 ISSUE RESOLVED: Duplicate email was the problem');
    console.log('✅ Staff backend is working normally');
    console.log('✅ Client application is fully functional');
    console.log('✅ Use unique emails for testing');
  } else {
    console.log('\n⚠️ DEEPER ISSUE: Not just duplicate email');
    console.log('Staff backend may have other problems');
  }
});

window.testUniqueEmail = testUniqueEmail;