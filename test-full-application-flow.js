/**
 * Complete Application Flow Test
 * Tests the full 6-step application process with real ATB bank statements
 */

// Test configuration
const testData = {
  // Step 1: Business Details
  businessName: "SITE ENGINEERING TECHNOLOGY INC",
  operatingName: "S E T Inc",
  businessLocation: "CA", // Canada
  fundingAmount: 50000,
  lookingFor: "working_capital",
  fundsPurpose: "working_capital",
  
  // Step 3: Business Information
  businessPhone: "+14035551234",
  businessEmail: "test@siteengineering.ca",
  businessAddress: "PO BOX 20056 Red Deer",
  businessCity: "Red Deer",
  businessState: "AB",
  businessPostalCode: "T4N 6X5",
  
  // Step 4: Applicant Information
  applicantFirstName: "Todd",
  applicantLastName: "Werboweski", 
  applicantEmail: "todd@werboweski.com",
  applicantPhone: "+14035551234",
  dateOfBirth: "1980-01-01",
  
  // Documents to upload (ATB bank statements - REAL FILES PROVIDED)
  documents: [
    "nov 2024_1753308255231.pdf",
    "dec 15_1753308255236.pdf", 
    "jan 15 2025_1753308255237.pdf",
    "feb 15 2025_1753308255237.pdf",
    "mar 15 2025_1753308255238.pdf",
    "Apr 15 2025_1753308255234.pdf"
  ]
};

console.log("🧪 Starting Complete Application Flow Test");
console.log("📊 Test Data:", testData);

// Function to simulate filling forms
function fillFormField(fieldName, value) {
  const field = document.querySelector(`[name="${fieldName}"], #${fieldName}, [data-testid="${fieldName}"]`);
  if (field) {
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    console.log(`✅ Filled ${fieldName}: ${value}`);
    return true;
  }
  console.log(`❌ Field not found: ${fieldName}`);
  return false;
}

// Function to click buttons
function clickButton(selector) {
  const button = document.querySelector(selector);
  if (button) {
    button.click();
    console.log(`✅ Clicked button: ${selector}`);
    return true;
  }
  console.log(`❌ Button not found: ${selector}`);
  return false;
}

// Export functions for manual testing
window.testFlowFunctions = {
  fillFormField,
  clickButton,
  testData
};

console.log("🔧 Test functions available: window.testFlowFunctions");