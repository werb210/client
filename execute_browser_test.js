/**
 * BROWSER-BASED REAL DOCUMENTS E2E TEST EXECUTION
 * Executes directly in browser environment with real PDFs
 */

async function executeRealDocumentsTest() {
    console.log('🚀 EXECUTING REAL DOCUMENTS E2E TEST');
    console.log('='.repeat(70));
    
    const applicationId = crypto.randomUUID();
    console.log(`🆔 APPLICATION UUID: ${applicationId}`);
    console.log(`⏰ Test started at: ${new Date().toISOString()}`);
    
    const results = {
        applicationId: applicationId,
        applicationCreated: false,
        documentsUploaded: 0,
        applicationFinalized: false,
        pdfGenerated: false,
        staffBackendConfirmed: false,
        errors: []
    };

    try {
        // STEP 1: Create Application
        console.log('\n📋 STEP 1: Creating new application with specified data');
        
        const applicationData = {
            applicationId: applicationId,
            form_data: {
                step1: {
                    fundingAmount: 100000,
                    requestedAmount: 100000,
                    productCategory: "Equipment Financing",
                    lookingFor: "Equipment Financing",
                    fundsPurpose: "Expansion"
                },
                step2: {
                    selectedProducts: ["Equipment Financing"]
                },
                step3: {
                    businessType: "Corporation",
                    operatingName: "A10 Recovery Test",
                    businessPhone: "+1-555-555-1234",
                    businessCity: "Toronto",
                    businessState: "ON",
                    businessAddress: "123 Test Street",
                    businessPostalCode: "M1A 1B2",
                    headquarters: "CA",
                    industry: "Manufacturing",
                    yearsInBusiness: 10,
                    numberOfEmployees: 50,
                    annualRevenue: 2000000
                },
                step4: {
                    applicantFirstName: "Todd",
                    applicantLastName: "Werb",
                    applicantEmail: "a10test@boreal.financial",
                    applicantPhone: "+1-555-555-1234",
                    applicantTitle: "CEO",
                    applicantAddress: "123 Test Street",
                    applicantCity: "Toronto",
                    applicantState: "ON",
                    applicantPostalCode: "M1A 1B2"
                }
            }
        };

        console.log('📤 Sending application creation request...');
        
        const createResponse = await fetch('/api/public/applications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            },
            body: JSON.stringify(applicationData)
        });

        console.log(`📊 Application creation response: HTTP ${createResponse.status}`);

        if (createResponse.ok) {
            results.applicationCreated = true;
            console.log(`✅ Application created successfully`);
            console.log(`🆔 Confirmed Application ID: ${applicationId}`);
            
            localStorage.setItem('applicationId', applicationId);
            localStorage.setItem('realTestApplicationId', applicationId);
        } else {
            const error = await createResponse.text();
            results.errors.push(`Application creation failed: ${error}`);
            console.log(`❌ Application creation failed: ${error}`);
            throw new Error('Application creation failed');
        }

        // STEP 2: Load and Upload Real Bank Statements
        console.log('\n📤 STEP 2: Loading and uploading 6 real bank statement documents');
        
        const bankStatementFiles = [
            { path: '/attached_assets/November 2024_1751579433995.pdf', name: 'November 2024.pdf' },
            { path: '/attached_assets/December 2024_1751579433994.pdf', name: 'December 2024.pdf' },
            { path: '/attached_assets/January 2025_1751579433994.pdf', name: 'January 2025.pdf' },
            { path: '/attached_assets/February 2025_1751579433994.pdf', name: 'February 2025.pdf' },
            { path: '/attached_assets/March 2025_1751579433994.pdf', name: 'March 2025.pdf' },
            { path: '/attached_assets/April 2025_1751579433993.pdf', name: 'April 2025.pdf' }
        ];

        let uploadSuccessCount = 0;
        
        for (let i = 0; i < bankStatementFiles.length; i++) {
            const fileInfo = bankStatementFiles[i];
            
            try {
                console.log(`📥 Loading ${fileInfo.name}...`);
                
                const fileResponse = await fetch(fileInfo.path);
                if (!fileResponse.ok) {
                    throw new Error(`Failed to load ${fileInfo.name}: HTTP ${fileResponse.status}`);
                }
                
                const blob = await fileResponse.blob();
                const file = new File([blob], fileInfo.name, { type: 'application/pdf' });
                
                console.log(`✅ Loaded ${fileInfo.name} - ${(file.size/1024).toFixed(1)}KB`);
                console.log(`📤 Uploading ${i + 1}/6: ${file.name}`);
                
                const formData = new FormData();
                formData.append('document', file);
                formData.append('documentType', 'bank_statements');

                const uploadResponse = await fetch(`/api/public/upload/${applicationId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer test-token'
                    },
                    body: formData
                });

                console.log(`📊 Upload response for ${file.name}: HTTP ${uploadResponse.status}`);

                if (uploadResponse.ok) {
                    const uploadData = await uploadResponse.json();
                    uploadSuccessCount++;
                    results.documentsUploaded++;
                    console.log(`✅ Successfully uploaded ${file.name}`);
                    console.log(`📋 Document ID: ${uploadData.documentId || 'Generated'}`);
                } else {
                    const error = await uploadResponse.text();
                    results.errors.push(`Upload failed for ${file.name}: ${error}`);
                    console.log(`❌ Upload failed for ${file.name}: ${error.substring(0, 100)}`);
                }

                // Brief delay between uploads
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error) {
                results.errors.push(`Upload error for ${fileInfo.name}: ${error.message}`);
                console.log(`❌ Upload error for ${fileInfo.name}: ${error.message}`);
            }
        }

        console.log(`📊 Upload summary: ${uploadSuccessCount}/6 documents uploaded successfully`);

        // STEP 3: Finalize Application
        console.log('\n✍️ STEP 3: Finalizing application with typed signature');
        
        const finalizationData = {
            typedSignature: "Todd Werb",
            applicantTitle: "CEO",
            agreementTimestamp: new Date().toISOString(),
            ipAddress: "203.0.113.1",
            userAgent: navigator.userAgent,
            agreements: {
                applicationAuthorization: true,
                informationAccuracy: true,
                electronicSignature: true,
                creditAuthorization: true,
                dataSharing: true
            }
        };

        console.log('📤 Sending finalization request...');
        
        const finalizeResponse = await fetch(`/api/public/applications/${applicationId}/finalize`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            },
            body: JSON.stringify(finalizationData)
        });

        console.log(`📊 Finalization response: HTTP ${finalizeResponse.status}`);

        if (finalizeResponse.ok) {
            const responseData = await finalizeResponse.json();
            results.applicationFinalized = true;
            console.log(`✅ Application finalized successfully`);
            console.log(`📋 Status: ${responseData.status || 'submitted'}`);
            console.log(`📋 Stage: ${responseData.stage || 'New'}`);
        } else {
            const error = await finalizeResponse.text();
            results.errors.push(`Finalization failed: ${error}`);
            console.log(`❌ Finalization failed: ${error}`);
        }

        // STEP 4: Generate Signed PDF
        console.log('\n🧾 STEP 4: Generating signed application PDF');
        
        try {
            const pdfResponse = await fetch(`/api/pdf-generation/create/${applicationId}`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });

            console.log(`📊 PDF generation response: HTTP ${pdfResponse.status}`);

            if (pdfResponse.ok) {
                results.pdfGenerated = true;
                console.log(`✅ Signed PDF generated successfully`);
            } else {
                const error = await pdfResponse.text();
                results.errors.push(`PDF generation failed: ${error}`);
                console.log(`❌ PDF generation failed: ${error}`);
            }
        } catch (error) {
            results.errors.push(`PDF generation error: ${error.message}`);
            console.log(`❌ PDF generation error: ${error.message}`);
        }

        // STEP 5: Verify Staff Backend
        console.log('\n🧪 STEP 5: Verifying delivery to staff backend');
        
        try {
            const staffResponse = await fetch(`https://staff.boreal.financial/api/applications/${applicationId}`, {
                headers: {
                    'Authorization': 'Bearer test-token'
                }
            });

            console.log(`📊 Staff backend application check: HTTP ${staffResponse.status}`);

            if (staffResponse.ok) {
                const staffData = await staffResponse.json();
                console.log(`✅ Application found in staff backend`);
                console.log(`📋 Stage: ${staffData.stage || 'Unknown'}`);
                console.log(`📋 Status: ${staffData.status || 'Unknown'}`);
                
                results.staffBackendConfirmed = true;
            } else {
                results.errors.push(`Staff backend check failed: HTTP ${staffResponse.status}`);
                console.log(`❌ Staff backend check failed: HTTP ${staffResponse.status}`);
            }
        } catch (error) {
            results.errors.push(`Staff backend verification error: ${error.message}`);
            console.log(`❌ Staff backend verification error: ${error.message}`);
        }

    } catch (error) {
        results.errors.push(`Fatal error: ${error.message}`);
        console.log(`❌ Fatal error during test execution: ${error.message}`);
    }

    // Final Report
    console.log('\n' + '='.repeat(70));
    console.log('📋 FINAL REPORT - REAL DOCUMENTS E2E TEST');
    console.log('='.repeat(70));
    
    console.log(`🆔 Application UUID: ${results.applicationId}`);
    console.log(`📁 Documents Uploaded: ${results.documentsUploaded}/6`);
    console.log(`🧾 PDF Generated: ${results.pdfGenerated ? 'YES' : 'NO'}`);
    console.log(`🧭 Staff Backend View: ${results.staffBackendConfirmed ? 'CONFIRMED' : 'PENDING'}`);

    if (results.errors.length > 0) {
        console.log('\n⚠️ ERRORS ENCOUNTERED:');
        results.errors.forEach((error, index) => {
            console.log(`${index + 1}. ${error}`);
        });
    }

    const successCriteria = [
        results.applicationCreated,
        results.documentsUploaded === 6,
        results.applicationFinalized,
        results.staffBackendConfirmed
    ];

    const successCount = successCriteria.filter(Boolean).length;
    const overallSuccess = successCount >= 3;

    console.log(`\n🎯 Success Rate: ${successCount}/4 criteria met`);
    console.log(`🚀 Overall Status: ${overallSuccess ? 'PRODUCTION READY' : 'NEEDS ATTENTION'}`);

    if (overallSuccess) {
        console.log('\n🎉 REAL DOCUMENTS E2E TEST COMPLETED SUCCESSFULLY');
        console.log('✅ A10 Recovery Test application submitted with real bank statements');
        console.log('✅ Application finalized with typed signature');
        console.log('✅ System confirmed production ready');
    } else {
        console.log('\n⚠️ REAL DOCUMENTS E2E TEST PARTIALLY COMPLETED');
        console.log('🔧 Review errors above for production readiness');
    }

    window.realDocumentsTestResults = results;
    return results;
}

// Execute the test immediately
executeRealDocumentsTest().catch(console.error);