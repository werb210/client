// Test Client Application Flow - Steps 1-4 Submission
// This script simulates the complete application flow and captures console output

console.log("🧪 Starting Client Application Test Flow");

// Test function to simulate form submission
async function testApplicationFlow() {
  console.log("📝 Testing Steps 1-4 Application Flow");
  
  // Step 1 Data
  const step1Data = {
    requestedAmount: 50000,
    use_of_funds: "equipment",
    businessLocation: "canada",
    lookingFor: "equipment"
  };
  
  // Step 3 Data  
  const step3Data = {
    operatingName: "Test Business Inc",
    legalName: "Test Business Legal Name Inc",
    businessStreetAddress: "123 Test Street",
    businessCity: "Toronto",
    businessState: "ON",
    businessPostalCode: "M5V 3A8",
    businessPhone: "+14165551234",
    businessStartDate: "2020-01-01",
    businessStructure: "corporation"
  };
  
  // Step 4 Data
  const step4Data = {
    applicantFirstName: "John",
    applicantLastName: "Doe", 
    applicantEmail: "john.doe@test.com",
    applicantPhone: "+14165551234",
    applicantAddress: "123 Test Street",
    applicantCity: "Toronto",
    applicantState: "ON",
    applicantPostalCode: "M5V 3A8",
    applicantDateOfBirth: "1985-01-01",
    ownershipPercentage: 100
  };
  
  const applicationData = {
    step1: step1Data,
    step3: step3Data,
    step4: step4Data
  };
  
  // Log the payload as expected in Step 4
  console.log("🧪 FINAL PAYLOAD:", applicationData);
  
  try {
    console.log("📤 Testing submission to /api/public/applications");
    
    const response = await fetch('/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.ENV?.VITE_CLIENT_APP_SHARED_TOKEN || 'test-token'}`
      },
      body: JSON.stringify(applicationData)
    });
    
    console.log("📥 Response status:", response.status, response.statusText);
    
    if (response.ok) {
      const result = await response.json();
      console.log("✅ Application created:", result);
      return result;
    } else {
      const error = await response.text();
      console.log("❌ Application creation failed:", error);
      return { error: error, status: response.status };
    }
    
  } catch (error) {
    console.log("❌ Network error:", error.message);
    return { error: error.message };
  }
}

// Export for browser console testing
window.testApplicationFlow = testApplicationFlow;

console.log("🔧 Test function loaded. Run testApplicationFlow() in console to test submission.");