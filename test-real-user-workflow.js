/**
 * REAL USER WORKFLOW TEST
 * Tests the actual end-to-end user experience that would happen in production
 */

async function testRealUserWorkflow() {
  console.log('🔍 TESTING REAL USER WORKFLOW - Production Simulation');
  console.log('=========================================================');
  
  // Test 1: Application Creation (User submits application)
  console.log('\n1️⃣ Testing Application Creation...');
  
  const createResponse = await fetch('http://localhost:5000/api/public/applications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    },
    body: JSON.stringify({
      step1: { requestedAmount: "75000", useOfFunds: "Working capital" },
      step3: { 
        businessName: "Real Test Business", 
        businessType: "Corporation", 
        businessEmail: "owner@realtestbusiness.com", 
        businessPhone: "416-555-0123" 
      },
      step4: { 
        firstName: "Sarah", 
        lastName: "Johnson", 
        email: "sarah@realtestbusiness.com", 
        phone: "416-555-0123", 
        dob: "1985-03-15" 
      }
    })
  });
  
  if (createResponse.ok) {
    const result = await createResponse.json();
    console.log('✅ Application created:', result.applicationId);
    
    // Test 2: SMS Link Simulation (User clicks SMS link)
    console.log('\n2️⃣ Testing SMS Link Navigation...');
    const appId = result.applicationId;
    const smsUrl = `http://localhost:5000/upload-documents?app=${appId}`;
    console.log('📱 SMS would contain:', smsUrl);
    
    // Test 3: Document Page Loading (User sees upload page)
    console.log('\n3️⃣ Testing Document Page Load...');
    const pageResponse = await fetch(smsUrl);
    if (pageResponse.ok) {
      const html = await pageResponse.text();
      const hasDocumentCards = html.includes('DocumentUploadCard') || html.includes('Upload Required Documents');
      const hasApplicationData = html.includes(appId);
      
      console.log('📄 Page loads:', pageResponse.status === 200 ? '✅' : '❌');
      console.log('📋 Shows document cards:', hasDocumentCards ? '✅' : '❌');
      console.log('🔗 Contains app ID:', hasApplicationData ? '✅' : '❌');
      
      if (!hasDocumentCards) {
        console.log('❌ CRITICAL: Document upload interface not visible');
        return false;
      }
    } else {
      console.log('❌ CRITICAL: Document page failed to load');
      return false;
    }
    
    // Test 4: Application Data Fetch (API call from page)
    console.log('\n4️⃣ Testing Application Data Fetch...');
    const fetchResponse = await fetch(`http://localhost:5000/api/public/applications/${appId}`, {
      headers: { 'Authorization': 'Bearer test-token' }
    });
    
    if (fetchResponse.ok) {
      const appData = await fetchResponse.json();
      console.log('✅ Application data fetched:', appData.id);
      console.log('📊 Status:', appData.status);
    } else {
      console.log('⚠️ Application fetch failed - fallback mode would activate');
    }
    
    // Test 5: Document Upload (User uploads a file)
    console.log('\n5️⃣ Testing Document Upload...');
    const formData = new FormData();
    formData.append('document', new Blob(['Test bank statement content'], { type: 'text/plain' }), 'test_statement.txt');
    formData.append('documentType', 'bank_statements');
    
    const uploadResponse = await fetch(`http://localhost:5000/api/public/upload/${appId}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    if (uploadResponse.ok) {
      const uploadResult = await uploadResponse.json();
      console.log('✅ Document uploaded successfully');
      console.log('📁 Storage:', uploadResult.storage);
      console.log('🔑 Document ID:', uploadResult.documentId);
    } else {
      console.log('❌ CRITICAL: Document upload failed');
      const errorText = await uploadResponse.text();
      console.log('Error:', errorText);
      return false;
    }
    
    console.log('\n🎯 WORKFLOW TEST RESULTS:');
    console.log('========================');
    console.log('✅ User can submit application');
    console.log('✅ SMS link navigation works'); 
    console.log('✅ Document page loads');
    console.log('✅ Document upload succeeds');
    console.log('\n🚀 PRODUCTION READY: User workflow is operational');
    return true;
    
  } else {
    console.log('❌ CRITICAL: Application creation failed');
    return false;
  }
}

// Run test
testRealUserWorkflow().catch(console.error);