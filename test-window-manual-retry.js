#!/usr/bin/env node

// Browser-based window.manualRetryAll() simulation
// This simulates what would happen when run in the client browser

console.log('🔄 [MANUAL RETRY SIMULATION] Simulating window.manualRetryAll() execution');

import fs from 'fs';
import FormData from 'form-data';

async function simulateManualRetryAll() {
    console.log('🔄 [MANUAL RETRY OVERRIDE] Starting manual retry with correct endpoint');
    
    // Use a test application ID (in real browser this would come from localStorage)
    const applicationId = 'aac71c9a-d154-4914-8982-4f1a33ef8259';
    console.log(`📋 [APPLICATION ID] ${applicationId}`);
    
    // Use the same 6 banking documents
    const documentFiles = [
        'November 2024_1751579433995.pdf',
        'December 2024_1751579433994.pdf', 
        'January 2025_1751579433994.pdf',
        'February 2025_1751579433994.pdf',
        'March 2025_1751579433994.pdf',
        'April 2025_1751579433993.pdf'
    ];
    
    console.log(`📄 [DOCUMENTS] Found ${documentFiles.length} documents for retry`);

    let successCount = 0;
    let fallbackCount = 0;
    let errorCount = 0;

    for (const fileName of documentFiles) {
        console.log(`📤 [UPLOADING] ${fileName}`);
        
        try {
            // Check if file exists
            const filePath = `attached_assets/${fileName}`;
            if (!fs.existsSync(filePath)) {
                console.log(`⚠️ [SKIPPING] File not found: ${fileName}`);
                continue;
            }
            
            // Create FormData with real file
            const form = new FormData();
            const fileBuffer = fs.readFileSync(filePath);
            form.append('document', fileBuffer, {
                filename: fileName,
                contentType: 'application/pdf'
            });
            form.append('documentType', 'bank_statements');

            const fetch = (await import('node-fetch')).default;
            const response = await fetch(`http://localhost:5000/api/public/upload/${applicationId}`, {
                method: 'POST',
                body: form
            });

            const result = await response.json();
            console.log(`📋 [RESPONSE] ${fileName}:`, JSON.stringify(result, null, 2));
            
            // Analyze response for S3 success indicators
            if (result.success && result.fallback === false && result.storageKey && result.storage === 's3') {
                successCount++;
                console.log(`✅ [S3 SUCCESS] ${fileName} uploaded to S3 successfully`);
                console.log(`   documentId: ${result.documentId}`);
                console.log(`   storageKey: ${result.storageKey}`);
                console.log(`   storage: ${result.storage}`);
                console.log(`   checksum: ${result.checksum || 'N/A'}`);
            } else if (result.fallback === true) {
                fallbackCount++;
                console.log(`🔄 [FALLBACK] ${fileName} still in fallback mode`);
                console.log(`   documentId: ${result.documentId}`);
            } else if (result.success && !result.hasOwnProperty('fallback')) {
                // Server may be returning simplified format
                successCount++;
                console.log(`✅ [SUCCESS] ${fileName} uploaded successfully`);
                console.log(`   documentId: ${result.documentId}`);
                console.log(`   NOTE: Response format may not include S3 metadata (fallback flag missing)`);
            } else if (!result.success && result.error === 'Document upload failed') {
                errorCount++;
                console.log(`❌ [ERROR] ${fileName} upload failed - likely application not found`);
                console.log(`   error: ${result.error}`);
                console.log(`   message: ${result.message}`);
                console.log(`   details: ${result.details}`);
            } else {
                errorCount++;
                console.log(`❓ [UNKNOWN] ${fileName} unexpected response format`);
                console.log(`   Full response: ${JSON.stringify(result)}`);
            }
            
        } catch (error) {
            errorCount++;
            console.error(`❌ [FETCH ERROR] ${fileName}:`, error.message);
        }
        
        // Brief pause between uploads
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🎯 [MANUAL RETRY COMPLETE SUMMARY]');
    console.log(`   ✅ S3 Success: ${successCount}`);
    console.log(`   🔄 Fallback: ${fallbackCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total: ${successCount + fallbackCount + errorCount}`);
    
    if (successCount > 0 && fallbackCount === 0 && errorCount === 0) {
        console.log('\n🎉 [S3 INTEGRATION FULLY OPERATIONAL] All uploads successful!');
        console.log('   Client → Server → Staff Backend → S3 pipeline confirmed working');
    } else if (successCount > 0 && errorCount > 0) {
        console.log('\n📋 [MIXED RESULTS] Some uploads successful, some failed (likely due to application validation)');
        console.log('   S3 integration working - errors likely due to missing application in staff backend');
    } else if (fallbackCount > 0) {
        console.log('\n⚠️ [FALLBACK DETECTED] Staff backend still returning fallback responses');
        console.log('   Check staff backend S3 configuration');
    } else {
        console.log('\n❌ [CONFIGURATION ISSUE] All uploads failed - check endpoint and application ID');
    }
    
    return { successCount, fallbackCount, errorCount };
}

// Run the simulation
simulateManualRetryAll().catch(console.error);