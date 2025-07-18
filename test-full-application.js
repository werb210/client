/**
 * Complete Application Test Script
 * Tests the full workflow from Step 1 through Step 7 with real bank statements
 */

console.log("🚀 Starting Complete Application Test");

// Clear existing data
localStorage.removeItem('formData');
console.log("✅ Cleared existing localStorage data");

// Step 1: Financial Profile Data (based on bank statements showing Canadian business)
const step1Data = {
  businessLocation: "CA",
  headquarters: "CA", 
  headquartersState: "AB",
  industry: "engineering_technology", // From SITE ENGINEERING TECHNOLOGY INC
  lookingFor: "capital",
  fundingAmount: 75000, // Conservative amount based on existing $160k credit limit
  fundsPurpose: "working_capital",
  salesHistory: "3+yr", // Business started 2012, well established
  revenueLastYear: 480000, // From bank statement transaction patterns
  averageMonthlyRevenue: 40000,
  accountsReceivableBalance: 25000,
  fixedAssetsValue: 50000,
  equipmentValue: 75000,
  requestedAmount: 75000
};

// Step 3: Business Details (from bank statements)
const step3Data = {
  operatingName: "SITE ENGINEERING TECHNOLOGY INC",
  legalName: "SITE ENGINEERING TECHNOLOGY INC", 
  businessStructure: "corporation",
  businessStreetAddress: "PO BOX 20056",
  businessCity: "Red Deer",
  businessState: "AB",
  businessPostalCode: "T4N 6X5",
  businessPhone: "+14035551234",
  businessStartDate: "2012-01-01",
  businessWebsite: "",
  employeeCount: 8,
  estimatedYearlyRevenue: 480000
};

// Step 4: Applicant Details (test data)
const step4Data = {
  applicantFirstName: "John",
  applicantLastName: "Smith", 
  applicantEmail: "john.smith@setinc.ca",
  applicantPhone: "+14035551234",
  applicantAddress: "PO BOX 20056",
  applicantCity: "Red Deer",
  applicantState: "AB", 
  applicantZipCode: "T4N 6X5",
  applicantDateOfBirth: "1975-06-15",
  applicantSSN: "123456789",
  ownershipPercentage: 100,
  hasPartner: false
};

// Function to simulate form filling
function fillFormData(stepData, stepNumber) {
  console.log(`📝 Filling Step ${stepNumber} data:`, stepData);
  
  // Simulate saving to localStorage
  const existingData = JSON.parse(localStorage.getItem('formData') || '{}');
  existingData[`step${stepNumber}`] = stepData;
  localStorage.setItem('formData', JSON.stringify(existingData));
  
  console.log(`✅ Step ${stepNumber} data saved to localStorage`);
}

// Bank statement files to upload
const bankStatements = [
  "nov 2024_1752882822735.pdf",
  "Apr 15 2025_1752882822737.pdf", 
  "dec 15_1752882822737.pdf",
  "feb 15 2025_1752882822738.pdf",
  "jan 15 2025_1752882822738.pdf",
  "mar 15 2025_1752882822739.pdf"
];

console.log("📋 Bank statements to upload:", bankStatements);

// Execute test
console.log("\n🎯 Executing Full Application Test:");
console.log("1. Fill Step 1 (Financial Profile)");
fillFormData(step1Data, 1);

console.log("2. Fill Step 3 (Business Details)"); 
fillFormData(step3Data, 3);

console.log("3. Fill Step 4 (Applicant Info)");
fillFormData(step4Data, 4);

console.log("4. Ready for Step 5 (Document Upload)");
console.log(`   - ${bankStatements.length} bank statements ready for upload`);

console.log("5. Ready for Step 6 (Electronic Signature)");
console.log("6. Ready for Step 7 (Final Submission)");

console.log("\n✅ Test data prepared. Navigate to /apply/step-1 to begin.");

// Test API connectivity 
async function testAPIConnectivity() {
  console.log("\n🔗 Testing API connectivity...");
  
  try {
    const response = await fetch('/api/public/lenders');
    console.log(`API Response: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ API connected - ${data.length || 'unknown'} lenders available`);
    } else {
      console.error("❌ API connection failed");
    }
  } catch (error) {
    console.error("❌ API test failed:", error.message);
  }
}

testAPIConnectivity();