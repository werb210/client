// Test script to verify the PATCH finalization actually works in the browser
console.log("🧪 Testing actual Step 6 finalization in browser...");

// Simulate the exact workflow that happens in Step6_TypedSignature.tsx
async function testFinalization() {
  const applicationId = "aabdb3c3-d322-4bb3-91ef-e78a8c747096"; // Known test app
  
  const finalApplicationData = {
    status: "submitted",
    signature: {
      signedName: "Test User",
      timestamp: new Date().toISOString(),
      ipAddress: "192.168.1.100",
      userAgent: navigator.userAgent,
      agreements: {
        applicationAuthorization: true,
        informationAccuracy: true,
        electronicSignature: true,
        creditAuthorization: true,
        dataSharing: true
      }
    }
  };

  console.log("📤 [TEST] Submitting finalization data:", finalApplicationData);

  try {
    // This is the exact call made by Step6_TypedSignature.tsx
    const response = await fetch(`/api/public/applications/${applicationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(finalApplicationData)
    });

    console.log("📥 [TEST] Response status:", response.status);
    console.log("📥 [TEST] Response ok:", response.ok);
    
    if (response.ok) {
      const result = await response.json();
      console.log("✅ [TEST] SUCCESS - Finalization response:", result);
      
      // Check if this is a real response or fallback
      if (result.application && result.application.updatedAt) {
        console.log("🎯 [TEST] CONFIRMED: Real staff backend response with timestamps");
      } else {
        console.log("⚠️ [TEST] WARNING: Might be fallback response");
      }
    } else {
      const error = await response.text();
      console.log("❌ [TEST] FAILED - Error response:", error);
    }
  } catch (error) {
    console.log("❌ [TEST] NETWORK ERROR:", error.message);
  }
}

// Run the test
testFinalization();