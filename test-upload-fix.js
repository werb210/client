// Test the newly implemented upload endpoint

console.log('🧪 Testing new S3 upload implementation...');

async function testUploadEndpoint() {
  try {
    // Create a test PDF file
    const testContent = new Uint8Array([
      0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34, 0x0A,
      0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A, 0x31, 0x20, 0x30,
      0x20, 0x6F, 0x62, 0x6A, 0x0A, 0x3C, 0x3C, 0x0A, 0x2F,
      0x54, 0x79, 0x70, 0x65, 0x20, 0x2F, 0x43, 0x61, 0x74
    ]);
    
    const testFile = new File([testContent], "test-bank-statement.pdf", {
      type: "application/pdf"
    });
    
    const formData = new FormData();
    formData.append('document', testFile);
    formData.append('documentType', 'bank_statements');
    
    console.log('📤 Testing upload endpoint...');
    
    const response = await fetch('/api/public/upload/test-app-12345', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token'
      },
      body: formData
    });
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Upload successful!');
      console.log('📋 Response:', result);
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ Upload failed');
      console.log('📋 Error:', errorText);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Make function available globally
window.testUploadEndpoint = testUploadEndpoint;

console.log('🔧 Run window.testUploadEndpoint() to test the new upload system');