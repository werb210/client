// Equipment Quote Upload Debug Test Script
// Run this in browser console to debug equipment_quote upload issues

console.log('🧪 Starting Equipment Quote Upload Debug Test');

// Test script to validate equipment_quote upload workflow
async function testEquipmentQuoteUpload() {
  console.log('\n=== EQUIPMENT QUOTE UPLOAD DEBUG TEST ===');
  
  // Step 1: Check if we're on Step 5 and have equipment_quote requirements
  const currentLocation = window.location.pathname;
  console.log(`📍 Current location: ${currentLocation}`);
  
  if (!currentLocation.includes('step-5')) {
    console.log('⚠️  Not on Step 5 - navigate to Step 5 to test equipment_quote upload');
    return;
  }
  
  // Step 2: Check for equipment_quote document requirements
  console.log('\n📋 Checking for equipment_quote document requirements...');
  
  // Look for equipment quote elements in the DOM
  const equipmentElements = document.querySelectorAll('[data-testid*="equipment"], [class*="equipment"], [id*="equipment"]');
  console.log(`Found ${equipmentElements.length} equipment-related elements`);
  
  equipmentElements.forEach((el, index) => {
    console.log(`  ${index + 1}. ${el.tagName}: ${el.textContent?.slice(0, 50)}...`);
  });
  
  // Step 3: Check document requirements in state
  console.log('\n🔍 Checking document requirements in application state...');
  
  try {
    // Try to access the React state through window debug helpers
    const debugState = window.debugApplication?.();
    if (debugState) {
      console.log('📊 Application state found:', debugState);
      
      // Check for equipment-related requirements
      const stateString = JSON.stringify(debugState, null, 2);
      if (stateString.includes('equipment')) {
        console.log('✅ Equipment requirements found in state');
        const equipmentMatches = stateString.match(/equipment[^"]*"/gi);
        console.log('Equipment matches:', equipmentMatches);
      } else {
        console.log('❌ No equipment requirements found in state');
      }
    }
  } catch (error) {
    console.log('⚠️  Could not access application state:', error.message);
  }
  
  // Step 4: Check for upload dropzones
  console.log('\n📂 Checking for upload dropzones...');
  
  const dropzones = document.querySelectorAll('[data-testid*="dropzone"], [class*="dropzone"], input[type="file"]');
  console.log(`Found ${dropzones.length} potential upload elements`);
  
  dropzones.forEach((el, index) => {
    console.log(`  ${index + 1}. ${el.tagName}: ${el.className || el.id || 'no class/id'}`);
  });
  
  // Step 5: Create a test file for equipment_quote
  console.log('\n📄 Creating test file for equipment_quote upload...');
  
  const testFileContent = 'Equipment Quote Test Content - PDF placeholder';
  const testFile = new File([testFileContent], 'test-equipment-quote.pdf', {
    type: 'application/pdf',
    lastModified: Date.now()
  });
  
  console.log(`Created test file: ${testFile.name} (${testFile.size} bytes)`);
  
  // Step 6: Test document type mapping
  console.log('\n🔄 Testing document type mapping...');
  
  const testLabels = [
    'Equipment Quote',
    'Equipment Quotes',
    'equipment quote',
    'equipment quotes',
    'Equipment Quote (Required)',
    'Equipment Quotes (Required)'
  ];
  
  // Simulate the getApiCategory function
  const getApiCategory = (label) => {
    const labelLower = label.toLowerCase();
    
    if (labelLower.includes('equipment') && labelLower.includes('quote')) {
      return 'equipment_quote';
    }
    
    return label.toLowerCase().replace(/\s+/g, '_');
  };
  
  testLabels.forEach(label => {
    const category = getApiCategory(label);
    console.log(`  "${label}" → "${category}"`);
  });
  
  // Step 7: Test upload endpoint accessibility
  console.log('\n🌐 Testing upload endpoint accessibility...');
  
  const applicationId = localStorage.getItem('applicationId') || 'test-app-id';
  const uploadEndpoint = `/api/public/applications/${applicationId}/documents`;
  
  console.log(`Testing endpoint: ${uploadEndpoint}`);
  
  try {
    // Test with OPTIONS request first
    const optionsResponse = await fetch(uploadEndpoint, {
      method: 'OPTIONS'
    });
    console.log(`OPTIONS request: ${optionsResponse.status} ${optionsResponse.statusText}`);
  } catch (error) {
    console.log('❌ OPTIONS request failed:', error.message);
  }
  
  // Step 8: Summary and recommendations
  console.log('\n📋 EQUIPMENT_QUOTE DEBUG SUMMARY:');
  console.log('1. Check if equipment_quote appears in document requirements');
  console.log('2. Verify document type mapping from UI label to API category');
  console.log('3. Test actual file upload with network tab monitoring');
  console.log('4. Check server logs for equipment_quote processing');
  console.log('5. Verify staff backend accepts equipment_quote document type');
  
  console.log('\n🔧 NEXT STEPS:');
  console.log('1. Navigate to Step 5 in the application');
  console.log('2. Look for equipment_quote document requirement');
  console.log('3. Attempt to upload a file and monitor console + network');
  console.log('4. Check server logs for equipment_quote debug messages');
  
  return {
    location: currentLocation,
    equipmentElements: equipmentElements.length,
    dropzones: dropzones.length,
    testFile: testFile.name,
    endpoint: uploadEndpoint,
    applicationId
  };
}

// Auto-run the test
testEquipmentQuoteUpload().then(result => {
  console.log('\n✅ Equipment Quote Debug Test Complete');
  console.log('Result:', result);
}).catch(error => {
  console.error('❌ Equipment Quote Debug Test Failed:', error);
});

// Additional utility functions
window.testEquipmentQuoteUpload = testEquipmentQuoteUpload;

window.simulateEquipmentQuoteUpload = async function(applicationId) {
  if (!applicationId) {
    applicationId = localStorage.getItem('applicationId') || prompt('Enter application ID:');
  }
  
  const testFile = new File(['Equipment Quote Test'], 'test-equipment-quote.pdf', {
    type: 'application/pdf'
  });
  
  const formData = new FormData();
  formData.append('document', testFile);
  formData.append('documentType', 'equipment_quote');
  
  console.log('🧪 Simulating equipment_quote upload...');
  console.log('File:', testFile.name);
  console.log('Document Type:', 'equipment_quote');
  console.log('Application ID:', applicationId);
  
  try {
    const response = await fetch(`/api/public/applications/${applicationId}/documents`, {
      method: 'POST',
      body: formData
    });
    
    console.log('Response Status:', response.status);
    console.log('Response OK:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success Response:', data);
    } else {
      const errorText = await response.text();
      console.log('Error Response:', errorText);
    }
    
    return response;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

console.log('🚀 Equipment Quote Debug utilities loaded:');
console.log('- testEquipmentQuoteUpload()');
console.log('- simulateEquipmentQuoteUpload(applicationId)');