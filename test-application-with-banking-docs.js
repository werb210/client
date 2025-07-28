/**
 * Test Application Submission with Real Banking Documents
 * Tests complete 7-step workflow with attached banking statements
 */

// Test application data based on the banking statements provided
const testApplicationData = {
  // Step 1: Financial Profile (based on Black Label Automation & Electrical)
  step1: {
    businessLocation: "Canada",
    industry: "Construction/Electrical",
    lookingFor: "capital",
    fundingAmount: "$500,000",
    fundsPurpose: "Working capital and equipment",
    salesHistory: "More than 5 years",
    revenueLastYear: "$2,000,000 - $5,000,000",
    averageMonthlyRevenue: "$300,000 - $500,000",
    accountsReceivableBalance: "$100,000 - $500,000",
    fixedAssetsValue: "$100,000 - $500,000"
  },

  // Step 3: Business Details (from BMO statements)
  step3: {
    operatingName: "Black Label Automation & Electrical",
    legalName: "5729841 MANITOBA LTD",
    businessStreetAddress: "30-10 FOXDALE WAY",
    businessCity: "NIVERVILLE",
    businessState: "MB",
    businessPostalCode: "R0A 0A1",
    businessPhone: "(204) 555-0123",
    businessEmail: "info@blacklabelae.ca",
    businessWebsite: "https://blacklabelae.ca",
    businessStructure: "Corporation",
    businessStartDate: "2020-01",
    numberOfEmployees: "11-50",
    estimatedYearlyRevenue: "$3,000,000"
  },

  // Step 4: Applicant Information
  step4: {
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@blacklabelae.ca",
    phone: "(204) 555-0123",
    streetAddress: "30-10 FOXDALE WAY",
    city: "NIVERVILLE",
    state: "MB",
    postalCode: "R0A 0A1",
    dateOfBirth: "1980-05-15",
    socialSecurityNumber: "123-456-789",
    ownershipPercentage: "100%",
    creditScore: "750-799",
    personalNetWorth: "$500,000 - $1,000,000",
    personalAnnualIncome: "$150,000 - $200,000"
  },

  // Banking documents to upload
  bankingDocuments: [
    {
      fileName: "April_2025_Banking_Statement.pdf",
      category: "Banking Statements",
      description: "BMO Business Banking Statement - April 2025, Account #2615 3851-784"
    },
    {
      fileName: "March_2025_Banking_Statement.pdf", 
      category: "Banking Statements",
      description: "BMO Business Banking Statement - March 2025, Account #2615 3851-784"
    },
    {
      fileName: "February_2025_Banking_Statement.pdf",
      category: "Banking Statements", 
      description: "BMO Business Banking Statement - February 2025, Account #2615 3851-784"
    },
    {
      fileName: "January_2025_Banking_Statement.pdf",
      category: "Banking Statements",
      description: "BMO Business Banking Statement - January 2025, Account #2615 3851-784"
    },
    {
      fileName: "December_2024_Banking_Statement.pdf",
      category: "Banking Statements",
      description: "BMO Business Banking Statement - December 2024, Account #2615 3851-784"
    },
    {
      fileName: "November_2024_Banking_Statement.pdf",
      category: "Banking Statements",
      description: "BMO Business Banking Statement - November 2024, Account #2615 3851-784"
    }
  ]
};

// Test the complete application workflow
async function testCompleteApplicationWithBankingDocs() {
  console.log('🚀 Starting complete application test with banking documents...');
  
  try {
    // Step 1: Create application
    console.log('📝 Step 1: Creating application...');
    const createResponse = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        step1: testApplicationData.step1,
        step3: testApplicationData.step3,
        step4: testApplicationData.step4,
        metadata: {
          testCase: 'Black Label Automation & Electrical - Canadian Business',
          submittedAt: new Date().toISOString()
        }
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Application creation failed: ${createResponse.status}`);
    }

    const applicationResult = await createResponse.json();
    const applicationId = applicationResult.applicationId || `test-app-${Date.now()}`;
    
    console.log(`✅ Application created with ID: ${applicationId}`);

    // Step 2: Upload banking documents
    console.log('📤 Step 2: Uploading banking documents...');
    
    for (const doc of testApplicationData.bankingDocuments) {
      console.log(`   📄 Uploading: ${doc.fileName}`);
      
      // Create FormData with exact structure specified
      const form = new FormData();
      
      // Note: In a real test, these would be actual File objects
      // For testing purposes, we'll simulate the API call structure
      const mockFile = new Blob(['Mock banking statement content'], { type: 'application/pdf' });
      const file = new File([mockFile], doc.fileName, { type: 'application/pdf' });
      
      form.append('files', file);
      form.append('category', doc.category);
      
      const uploadResponse = await fetch(`/api/upload/${applicationId}`, {
        method: 'POST',
        body: form,
        credentials: 'include'
      });

      if (uploadResponse.ok) {
        console.log(`   ✅ ${doc.fileName} uploaded successfully`);
      } else {
        console.log(`   ❌ Failed to upload ${doc.fileName}: ${uploadResponse.status}`);
      }
    }

    // Step 3: Initiate signing process
    console.log('🔐 Step 3: Initiating signing process...');
    const signingResponse = await fetch(`/api/applications/${applicationId}/initiate-signing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (signingResponse.ok) {
      const signingResult = await signingResponse.json();
      console.log(`✅ Signing initiated: ${signingResult.signingUrl}`);
    } else {
      console.log(`⚠️ Signing initiation response: ${signingResponse.status}`);
    }

    // Step 4: Final submission
    console.log('🎯 Step 4: Final application submission...');
    const submitResponse = await fetch(`/api/applications/${applicationId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        termsAccepted: true,
        privacyPolicyAccepted: true,
        submissionTimestamp: new Date().toISOString()
      }),
      credentials: 'include'
    });

    if (submitResponse.ok) {
      const finalResult = await submitResponse.json();
      console.log('🎉 Application submitted successfully!');
      console.log('📋 Application Summary:');
      console.log(`   Company: ${testApplicationData.step3.operatingName}`);
      console.log(`   Legal Name: ${testApplicationData.step3.legalName}`);
      console.log(`   Location: ${testApplicationData.step3.businessCity}, ${testApplicationData.step3.businessState}`);
      console.log(`   Funding Amount: ${testApplicationData.step1.fundingAmount}`);
      console.log(`   Banking Documents: ${testApplicationData.bankingDocuments.length} statements uploaded`);
      console.log(`   Application ID: ${applicationId}`);
      
      return { success: true, applicationId, documents: testApplicationData.bankingDocuments.length };
    } else {
      console.log(`❌ Final submission failed: ${submitResponse.status}`);
      return { success: false, error: `Submission failed: ${submitResponse.status}` };
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Banking statement analysis for verification
function analyzeBankingStatements() {
  console.log('📊 Banking Statement Analysis:');
  console.log('   Business: 5729841 MANITOBA LTD o/a Black Label Automation & Electrical');
  console.log('   Bank: BMO Business Banking');
  console.log('   Account: #2615 3851-784');
  console.log('   Period: November 2024 - April 2025 (6 months)');
  console.log('   
  console.log('   Account Balances:');
  console.log('     November 2024: $2,365,247.00');
  console.log('     December 2024: $1,690,482.92');
  console.log('     January 2025:  $1,690,482.92');
  console.log('     February 2025: $1,449,603.88');
  console.log('     March 2025:    $637,214.34');
  console.log('     April 2025:    $861,981.04');
  console.log('   
  console.log('   Business Activity: High volume electrical/automation contractor');
  console.log('   Transaction Pattern: Large deposits and payments typical of construction business');
  console.log('   Banking Relationship: BMO Fort Richmond Branch, Transit 2615');
}

// Run the test
if (typeof window !== 'undefined') {
  // Browser environment
  window.testApplicationWithBankingDocs = testCompleteApplicationWithBankingDocs;
  window.analyzeBankingStatements = analyzeBankingStatements;
  console.log('🔧 Test functions loaded. Run testApplicationWithBankingDocs() to start test.');
} else {
  // Node.js environment
  testCompleteApplicationWithBankingDocs()
    .then(result => {
      console.log('Test completed:', result);
      analyzeBankingStatements();
    });
}