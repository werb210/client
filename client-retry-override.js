/**
 * CLIENT APPLICATION PATCH - Override retry path to hit correct endpoint
 */

// Override window.manualRetryAll function
window.manualRetryAll = async () => {
  console.log('🔄 [MANUAL RETRY OVERRIDE] Starting manual retry with correct endpoint');
  
  const applicationId = localStorage.getItem("applicationId");
  if (!applicationId) {
    console.error('❌ [ERROR] No applicationId found in localStorage');
    return;
  }
  
  console.log(`📋 [APPLICATION ID] ${applicationId}`);
  
  // Simulate getting unconfirmed bank documents (replace with actual implementation)
  const getUnconfirmedBankDocuments = async () => {
    // For testing, we'll use the same 6 banking documents
    const documentFiles = [
      'November 2024_1751579433995.pdf',
      'December 2024_1751579433994.pdf', 
      'January 2025_1751579433994.pdf',
      'February 2025_1751579433994.pdf',
      'March 2025_1751579433994.pdf',
      'April 2025_1751579433993.pdf'
    ];
    
    const docs = [];
    for (const fileName of documentFiles) {
      // Mock file blob for testing (replace with actual file handling)
      docs.push({
        name: fileName,
        type: "bank_statements",
        blob: new Blob([`Mock content for ${fileName}`], { type: 'application/pdf' })
      });
    }
    return docs;
  };

  const docs = await getUnconfirmedBankDocuments();
  console.log(`📄 [DOCUMENTS] Found ${docs.length} documents for retry`);

  let successCount = 0;
  let failureCount = 0;

  for (const file of docs) {
    console.log(`📤 [UPLOADING] ${file.name}`);
    
    const form = new FormData();
    form.append("document", file.blob, file.name);
    form.append("documentType", file.type || "bank_statements");

    try {
      const res = await fetch(`/api/public/upload/${applicationId}`, {
        method: "POST",
        body: form,
      });

      const json = await res.json();
      console.log("📤 Retry Result:", json);
      
      // Check for S3 success indicators
      if (json.success && json.fallback === false && json.storageKey && json.storage === 's3') {
        successCount++;
        console.log(`✅ [S3 SUCCESS] ${file.name} uploaded successfully`);
        console.log(`   documentId: ${json.documentId}`);
        console.log(`   storageKey: ${json.storageKey}`);
        console.log(`   storage: ${json.storage}`);
      } else if (json.fallback === true) {
        failureCount++;
        console.log(`❌ [FALLBACK] ${file.name} still in fallback mode`);
      } else {
        failureCount++;
        console.log(`❌ [ERROR] ${file.name} unexpected response`);
      }
      
    } catch (error) {
      failureCount++;
      console.error(`❌ [FETCH ERROR] ${file.name}:`, error);
    }
  }
  
  console.log(`🎯 [RETRY COMPLETE] Success: ${successCount}, Failures: ${failureCount}`);
  
  if (successCount === docs.length) {
    console.log('🎉 [ALL SUCCESS] All documents uploaded to S3 successfully!');
  } else {
    console.log('⚠️ [PARTIAL/FAILED] Some documents still in fallback mode');
  }
  
  return { successCount, failureCount, total: docs.length };
};

console.log('✅ [OVERRIDE INSTALLED] window.manualRetryAll function updated');
console.log('📋 [USAGE] Run window.manualRetryAll() to test with correct endpoint');