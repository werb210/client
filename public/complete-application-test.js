/**
 * Complete Application Test - Using Real Bank Statements
 * Run this in browser console at http://localhost:5000
 */

console.log("🚀 COMPLETE APPLICATION TEST STARTING");
console.log("Testing with SITE ENGINEERING TECHNOLOGY INC bank statements");

// Clear any existing data
localStorage.removeItem('formData');
console.log("✅ Cleared existing localStorage");

// Step 1: Financial Profile (based on ATB bank statements)
const step1Data = {
  businessLocation: "CA",
  headquarters: "CA", 
  headquartersState: "AB",
  industry: "engineering", 
  lookingFor: "capital",
  fundingAmount: 75000,
  fundsPurpose: "working_capital",
  salesHistory: "3+yr",
  revenueLastYear: 480000,
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

// Step 4: Applicant Details
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

// Store all data
const formData = {
  step1: step1Data,
  step3: step3Data,
  step4: step4Data,
  currentStep: 1,
  isComplete: false,
  applicationId: "",
  signingUrl: "",
  step1Completed: false,
  step2Completed: false, 
  step3Completed: false,
  step4Completed: false,
  step5Completed: false,
  step6Completed: false,
  step5DocumentUpload: { uploadedFiles: [] },
  step6Signature: {},
  step6Authorization: {}
};

localStorage.setItem('formData', JSON.stringify(formData));
console.log("✅ Pre-filled all form data");

// Test API connectivity
async function testAPI() {
  console.log("\n🔗 Testing API connectivity...");
  
  try {
    const response = await fetch('/api/public/lenders');
    console.log(`API Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ API working - ${data.length || 'unknown'} lenders loaded`);
    } else {
      console.error("❌ API failed:", response.status);
    }
  } catch (error) {
    console.error("❌ API error:", error.message);
  }
}

// Bank statements ready for upload
const bankStatements = [
  "nov 2024_1752882822735.pdf",
  "Apr 15 2025_1752882822737.pdf",
  "dec 15_1752882822737.pdf", 
  "feb 15 2025_1752882822738.pdf",
  "jan 15 2025_1752882822738.pdf",
  "mar 15 2025_1752882822739.pdf"
];

console.log("\n📋 Bank statements ready for Step 5:");
bankStatements.forEach((file, i) => {
  console.log(`${i+1}. ${file}`);
});

// Instructions for manual test execution
console.log("\n📝 MANUAL TEST EXECUTION STEPS:");
console.log("1. Navigate to /apply/step-1");
console.log("2. All forms are pre-filled - just click through Steps 1-4");
console.log("3. In Step 5, upload the 6 bank statement PDFs");
console.log("4. Step 6: Complete electronic signature authorization");
console.log("5. Step 7: Submit final application");
console.log("\n🎯 Expected Results:");
console.log("- All steps complete without errors");
console.log("- Documents upload successfully (HTTP 201)");
console.log("- Application submits to staff backend");
console.log("- Final status: submitted");

// Run API test
testAPI();

console.log("\n✅ TEST SETUP COMPLETE - Navigate to /apply/step-1 to begin");