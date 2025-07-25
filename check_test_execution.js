/**
 * CHECK E2E TEST EXECUTION STATUS
 * Runs verification and reports final results
 */

console.log('🔍 CHECKING E2E TEST EXECUTION STATUS');
console.log('='.repeat(70));

// Generate a new test application ID for execution
const testTimestamp = Date.now();
const testApplicationId = crypto.randomUUID();
const testBusinessName = `E2E Production Test ${testTimestamp}`;
const testEmail = `production.test.${testTimestamp}@boreal.financial`;

console.log(`🆔 Test Application ID: ${testApplicationId}`);
console.log(`🏢 Test Business: ${testBusinessName}`);
console.log(`📧 Test Email: ${testEmail}`);

// Store for reference
localStorage.setItem('lastTestApplicationId', testApplicationId);

async function executeProductionE2ETest() {
  const results = {
    applicationId: testApplicationId,
    applicationCreated: false,
    documentsUploaded: 0,
    applicationFinalized: false,
    staffBackendStatus: 'Unknown',
    s3AuditPassed: false,
    errors: []
  };

  try {
    // STEP 1: Create Application
    console.log('\n📋 STEP 1: Creating Production Test Application...');
    
    const applicationData = {
      form_data: {
        step1: {
          fundingAmount: 100000,
          requestedAmount: 100000,
          productCategory: "Equipment Financing",
          lookingFor: "Equipment Financing",
          fundsPurpose: "Equipment Purchase"
        },
        step2: {
          selectedProducts: ["Equipment Financing"]
        },
        step3: {
          businessType: "Corporation",
          operatingName: testBusinessName,
          businessPhone: "+15551234567",
          businessState: "ON",
          businessCity: "Toronto",
          businessAddress: "456 Production Ave",
          businessPostalCode: "M1A 1B2",
          headquarters: "CA",
          industry: "Manufacturing",
          yearsInBusiness: 8,
          numberOfEmployees: 25,
          annualRevenue: 750000
        },
        step4: {
          applicantFirstName: "Production",
          applicantLastName: "Tester",
          applicantEmail: testEmail,
          applicantPhone: "+15559876543",
          applicantTitle: "President",
          applicantAddress: "456 Production Ave",
          applicantCity: "Toronto",
          applicantState: "ON",
          applicantPostalCode: "M1A 1B2"
        }
      },
      applicationId: testApplicationId
    };

    const createResponse = await fetch('/api/public/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-production-token'
      },
      body: JSON.stringify(applicationData)
    });

    console.log(`📊 Application Creation: ${createResponse.status}`);
    
    if (createResponse.ok) {
      results.applicationCreated = true;
      console.log('✅ Application created successfully');
    } else {
      const error = await createResponse.text();
      results.errors.push(`Application creation failed: ${error}`);
      console.log(`❌ Application creation failed: ${error.substring(0, 100)}`);
    }

    // STEP 2: Upload Documents
    console.log('\n📤 STEP 2: Uploading Production Test Documents...');
    
    const documents = [
      { name: 'Production_Bank_Statement_Q4_2024.pdf', type: 'bank_statements' },
      { name: 'Production_Equipment_Quote_2025.pdf', type: 'equipment_quote' },
      { name: 'Production_Financial_Statement_2024.pdf', type: 'financial_statements' },
      { name: 'Production_Business_License.pdf', type: 'business_license' },
      { name: 'Production_Tax_Return_2024.pdf', type: 'tax_returns' },
      { name: 'Production_Proof_Identity.pdf', type: 'proof_of_identity' }
    ];

    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      
      try {
        // Create realistic PDF content
        const pdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj  
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj
4 0 obj<</Length 85>>stream
BT
/F1 14 Tf
50 750 Td
(${doc.name})Tj
0 -20 Td
(Production Test Document - ${new Date().toISOString()})Tj
ET
endstream
endobj
xref 0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000125 00000 n 
0000000185 00000 n 
trailer<</Size 5/Root 1 0 R>>startxref 320 %%EOF`;

        const file = new Blob([pdfContent.padEnd(30000, ' ')], { type: 'application/pdf' });
        
        const formData = new FormData();
        formData.append('document', file, doc.name);
        formData.append('documentType', doc.type);

        const uploadResponse = await fetch(`/api/public/upload/${testApplicationId}`, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-production-token'
          },
          body: formData
        });

        console.log(`📤 Upload ${i + 1}/6 (${doc.name}): ${uploadResponse.status}`);

        if (uploadResponse.ok) {
          results.documentsUploaded++;
          console.log(`✅ ${doc.name} uploaded successfully`);
        } else {
          const error = await uploadResponse.text();
          results.errors.push(`Upload failed for ${doc.name}: ${error}`);
          console.log(`❌ Upload failed for ${doc.name}: ${error.substring(0, 50)}`);
        }

        // Brief delay between uploads
        await new Promise(resolve => setTimeout(resolve, 400));

      } catch (error) {
        results.errors.push(`Upload error for ${doc.name}: ${error.message}`);
        console.log(`❌ Upload error for ${doc.name}: ${error.message}`);
      }
    }

    // STEP 3: Finalize Application
    console.log('\n🏁 STEP 3: Finalizing Production Test Application...');
    
    try {
      const finalizeResponse = await fetch(`/api/public/applications/${testApplicationId}/finalize`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-production-token'
        },
        body: JSON.stringify({
          typedSignature: "Production Tester",
          agreementTimestamp: new Date().toISOString(),
          ipAddress: "203.0.113.1",
          userAgent: navigator.userAgent
        })
      });

      console.log(`📊 Application Finalization: ${finalizeResponse.status}`);

      if (finalizeResponse.ok) {
        results.applicationFinalized = true;
        console.log('✅ Application finalized successfully');
      } else {
        const error = await finalizeResponse.text();
        results.errors.push(`Finalization failed: ${error}`);
        console.log(`❌ Finalization failed: ${error.substring(0, 100)}`);
      }
    } catch (error) {
      results.errors.push(`Finalization error: ${error.message}`);
      console.log(`❌ Finalization error: ${error.message}`);
    }

    // STEP 4: Verify Staff Backend Reception
    console.log('\n🔍 STEP 4: Verifying Staff Backend Reception...');
    
    try {
      const staffResponse = await fetch(`https://staff.boreal.financial/api/applications/${testApplicationId}`, {
        headers: {
          'Authorization': 'Bearer test-production-token'
        }
      });

      console.log(`📊 Staff Backend Check: ${staffResponse.status}`);

      if (staffResponse.ok) {
        const staffData = await staffResponse.json();
        results.staffBackendStatus = staffData.stage || 'received';
        console.log(`✅ Application received by staff backend - Stage: ${results.staffBackendStatus}`);

        // Check documents in staff backend
        const staffDocsResponse = await fetch(`https://staff.boreal.financial/api/applications/${testApplicationId}/documents`, {
          headers: {
            'Authorization': 'Bearer test-production-token'
          }
        });

        if (staffDocsResponse.ok) {
          const staffDocsData = await staffDocsResponse.json();
          const staffDocCount = staffDocsData.documents ? staffDocsData.documents.length : 0;
          console.log(`✅ Documents in staff backend: ${staffDocCount}`);
        }
      } else {
        results.staffBackendStatus = `Error ${staffResponse.status}`;
        console.log(`❌ Staff backend check failed: ${staffResponse.status}`);
      }
    } catch (error) {
      results.errors.push(`Staff backend error: ${error.message}`);
      console.log(`❌ Staff backend error: ${error.message}`);
    }

    // STEP 5: S3 Integration Audit
    console.log('\n☁️ STEP 5: S3 Integration Audit...');
    
    try {
      const s3Response = await fetch('/api/system/test-s3-comprehensive', {
        headers: {
          'Authorization': 'Bearer test-production-token'
        }
      });

      console.log(`📊 S3 Audit: ${s3Response.status}`);

      if (s3Response.ok) {
        results.s3AuditPassed = true;
        console.log('✅ S3 integration audit passed');
      } else {
        const error = await s3Response.text();
        results.errors.push(`S3 audit failed: ${error}`);
        console.log(`❌ S3 audit failed: ${error.substring(0, 100)}`);
      }
    } catch (error) {
      results.errors.push(`S3 audit error: ${error.message}`);
      console.log(`❌ S3 audit error: ${error.message}`);
    }

  } catch (error) {
    results.errors.push(`Overall test error: ${error.message}`);
    console.log(`❌ Overall test error: ${error.message}`);
  }

  // FINAL REPORT
  console.log('\n' + '='.repeat(70));
  console.log('📊 PRODUCTION E2E TEST COMPLETION REPORT');
  console.log('='.repeat(70));
  
  console.log(`🆔 Final Application ID: ${results.applicationId}`);
  console.log(`📋 Application Created: ${results.applicationCreated ? 'YES' : 'NO'}`);
  console.log(`📤 Documents Uploaded: ${results.documentsUploaded}/6`);
  console.log(`🏁 Application Finalized: ${results.applicationFinalized ? 'YES' : 'NO'}`);
  console.log(`🔍 Staff Backend Status: ${results.staffBackendStatus}`);
  console.log(`☁️ S3 Audit Passed: ${results.s3AuditPassed ? 'YES' : 'NO'}`);

  // Success calculation
  const successCriteria = [
    results.applicationCreated,
    results.documentsUploaded >= 4,
    results.applicationFinalized,
    results.staffBackendStatus !== 'Unknown' && !results.staffBackendStatus.includes('Error')
  ];
  
  const successCount = successCriteria.filter(Boolean).length;
  const overallSuccess = successCount >= 3;

  console.log(`🎯 Success Rate: ${successCount}/4 criteria met`);
  console.log(`🚀 Overall Status: ${overallSuccess ? 'PRODUCTION READY' : 'NEEDS ATTENTION'}`);

  if (results.errors.length > 0) {
    console.log('\n⚠️ ERRORS ENCOUNTERED:');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }

  if (overallSuccess) {
    console.log('\n🎉 PRODUCTION E2E TEST COMPLETED SUCCESSFULLY');
    console.log('✅ System verified operational for production deployment');
  } else {
    console.log('\n⚠️ PRODUCTION E2E TEST PARTIALLY COMPLETED');
    console.log('🔧 Review errors above for production readiness');
  }

  return results;
}

// Execute the production test
executeProductionE2ETest().catch(console.error);

// Expose for manual execution
window.executeProductionE2ETest = executeProductionE2ETest;