// Direct execution script for real documents E2E test
(async function() {
    console.log('🚀 STARTING REAL DOCUMENTS E2E TEST EXECUTION');
    
    const applicationId = crypto.randomUUID();
    console.log('🆔 Generated Application ID:', applicationId);
    
    // Create application
    try {
        const createResponse = await fetch('/api/public/applications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            },
            body: JSON.stringify({
                applicationId: applicationId,
                form_data: {
                    step1: {
                        fundingAmount: 100000,
                        requestedAmount: 100000,
                        productCategory: "Equipment Financing",
                        fundsPurpose: "Expansion"
                    },
                    step3: {
                        businessType: "Corporation",
                        operatingName: "A10 Recovery Test",
                        businessPhone: "+1-555-555-1234"
                    },
                    step4: {
                        applicantFirstName: "Todd",
                        applicantLastName: "Werb",
                        applicantEmail: "a10test@boreal.financial",
                        applicantTitle: "CEO"
                    }
                }
            })
        });
        
        console.log('📊 Application creation:', createResponse.status);
        
        if (createResponse.ok) {
            console.log('✅ Application created successfully');
            
            // Upload documents
            const files = [
                'November 2024_1751579433995.pdf',
                'December 2024_1751579433994.pdf', 
                'January 2025_1751579433994.pdf',
                'February 2025_1751579433994.pdf',
                'March 2025_1751579433994.pdf',
                'April 2025_1751579433993.pdf'
            ];
            
            let uploadCount = 0;
            for (const fileName of files) {
                try {
                    const fileResponse = await fetch(`/attached_assets/${fileName}`);
                    if (fileResponse.ok) {
                        const blob = await fileResponse.blob();
                        const file = new File([blob], fileName.replace('_1751579433995', '').replace('_1751579433994', '').replace('_1751579433993', ''), { type: 'application/pdf' });
                        
                        const formData = new FormData();
                        formData.append('document', file);
                        formData.append('documentType', 'bank_statements');
                        
                        const uploadResponse = await fetch(`/api/public/upload/${applicationId}`, {
                            method: 'POST',
                            headers: { 'Authorization': 'Bearer test-token' },
                            body: formData
                        });
                        
                        if (uploadResponse.ok) {
                            uploadCount++;
                            console.log(`✅ Uploaded ${file.name} (${uploadCount}/6)`);
                        } else {
                            console.log(`❌ Upload failed for ${file.name}:`, uploadResponse.status);
                        }
                    }
                } catch (error) {
                    console.log(`❌ Error with ${fileName}:`, error.message);
                }
            }
            
            console.log(`📊 Total uploads: ${uploadCount}/6`);
            
            // Finalize application
            const finalizeResponse = await fetch(`/api/public/applications/${applicationId}/finalize`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-token'
                },
                body: JSON.stringify({
                    typedSignature: "Todd Werb",
                    applicantTitle: "CEO",
                    agreementTimestamp: new Date().toISOString()
                })
            });
            
            console.log('📊 Finalization response:', finalizeResponse.status);
            
            if (finalizeResponse.ok) {
                console.log('✅ Application finalized successfully');
                
                // Final report
                console.log('\n📋 FINAL REPORT:');
                console.log('🆔 Application ID:', applicationId);
                console.log('📤 Documents uploaded:', uploadCount, '/6');
                console.log('🏁 Status: Finalized');
                console.log('✅ Real documents E2E test completed');
            }
        }
    } catch (error) {
        console.log('❌ Test execution error:', error.message);
    }
})();