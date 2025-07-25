#!/usr/bin/env node

// Manual Retry Override Test - Simulating client-side function
console.log('🔄 [MANUAL RETRY OVERRIDE TEST] Starting test with correct endpoint');

import fs from 'fs';
import FormData from 'form-data';

async function testManualRetryOverride() {
    const testApplicationId = 'aac71c9a-d154-4914-8982-4f1a33ef8259';
    console.log(`📋 [APPLICATION ID] ${testApplicationId}`);
    
    // Test with the same 6 banking documents
    const documentFiles = [
        'November 2024_1751579433995.pdf',
        'December 2024_1751579433994.pdf', 
        'January 2025_1751579433994.pdf',
        'February 2025_1751579433994.pdf',
        'March 2025_1751579433994.pdf',
        'April 2025_1751579433993.pdf'
    ];
    
    console.log(`📄 [DOCUMENTS] Testing ${documentFiles.length} documents for retry`);

    let successCount = 0;
    let fallbackCount = 0;
    let errorCount = 0;

    for (const fileName of documentFiles) {
        console.log(`📤 [UPLOADING] ${fileName}`);
        
        try {
            // Create FormData with proper file handling
            const form = new FormData();
            
            // Check if file exists, otherwise skip
            const filePath = `attached_assets/${fileName}`;
            if (!fs.existsSync(filePath)) {
                console.log(`⚠️ [SKIPPING] File not found: ${fileName}`);
                continue;
            }
            
            // Read the actual file with proper content type
            const fileBuffer = fs.readFileSync(filePath);
            form.append('document', fileBuffer, {
                filename: fileName,
                contentType: 'application/pdf'
            });
            form.append('documentType', 'bank_statements');

            const fetch = (await import('node-fetch')).default;
            const response = await fetch(`http://localhost:5000/api/public/upload/${testApplicationId}`, {
                method: 'POST',
                body: form
            });

            const result = await response.json();
            console.log(`📋 [RESPONSE] ${fileName}:`, JSON.stringify(result, null, 2));
            
            // Analyze response for S3 success indicators
            if (result.success && result.fallback === false && result.storageKey && result.storage === 's3') {
                successCount++;
                console.log(`✅ [S3 SUCCESS] ${fileName} uploaded successfully`);
                console.log(`   documentId: ${result.documentId}`);
                console.log(`   storageKey: ${result.storageKey}`);
                console.log(`   storage: ${result.storage}`);
                console.log(`   checksum: ${result.checksum}`);
            } else if (result.fallback === true) {
                fallbackCount++;
                console.log(`🔄 [FALLBACK] ${fileName} still in fallback mode`);
                console.log(`   documentId: ${result.documentId}`);
            } else if (!result.success) {
                errorCount++;
                console.log(`❌ [ERROR] ${fileName} upload failed`);
                console.log(`   error: ${result.error}`);
                console.log(`   message: ${result.message}`);
            } else {
                errorCount++;
                console.log(`❓ [UNKNOWN] ${fileName} unexpected response format`);
            }
            
        } catch (error) {
            errorCount++;
            console.error(`❌ [FETCH ERROR] ${fileName}:`, error.message);
        }
        
        // Brief pause between uploads
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🎯 [RETRY COMPLETE SUMMARY]');
    console.log(`   ✅ S3 Success: ${successCount}`);
    console.log(`   🔄 Fallback: ${fallbackCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total: ${successCount + fallbackCount + errorCount}`);
    
    if (successCount > 0) {
        console.log('\n🎉 [S3 INTEGRATION WORKING] Staff backend S3 is operational!');
    } else if (fallbackCount > 0) {
        console.log('\n⚠️ [FALLBACK MODE] Staff backend still returning fallback responses');
    } else {
        console.log('\n❌ [CONFIGURATION ISSUE] Upload errors - check MIME type and endpoint configuration');
    }
    
    return { successCount, fallbackCount, errorCount };
}

// Run the test
testManualRetryOverride().catch(console.error);