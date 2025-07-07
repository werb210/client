/**
 * Test AccordAccess Working Capital Document Requirements
 * Check what documents are required for the specific AccordAccess product
 */

async function testAccordAccessDocuments() {
  console.log('📄 Testing AccordAccess Working Capital Document Requirements');
  console.log('=' * 60);

  try {
    // First, get the AccordAccess product details
    const productsResponse = await fetch('http://localhost:5000/api/public/lenders');
    const productsData = await productsResponse.json();
    
    if (productsData.success && productsData.products) {
      // Find AccordAccess product
      const accordAccess = productsData.products.find(product => 
        product.name === 'AccordAccess' && product.country === 'CA'
      );
      
      if (accordAccess) {
        console.log('✅ Found AccordAccess Product:');
        console.log(`   Name: ${accordAccess.name}`);
        console.log(`   Lender: ${accordAccess.lenderName}`);
        console.log(`   Category: ${accordAccess.category}`);
        console.log(`   Amount: $${accordAccess.amountMin?.toLocaleString()} - $${accordAccess.amountMax?.toLocaleString()}`);
        console.log(`   Required Documents: ${JSON.stringify(accordAccess.requiredDocuments, null, 2)}`);
        
        console.log('\n📋 AccordAccess Required Documents:');
        if (accordAccess.requiredDocuments && accordAccess.requiredDocuments.length > 0) {
          accordAccess.requiredDocuments.forEach((doc, index) => {
            console.log(`${index + 1}. ${doc}`);
          });
        } else {
          console.log('   No specific documents listed in product data');
        }
      } else {
        console.log('❌ AccordAccess product not found');
      }
    }

    // Test the document requirements API endpoint
    console.log('\n🔍 Testing Document Requirements API...');
    const docResponse = await fetch('http://localhost:5000/api/loan-products/required-documents/working_capital');
    
    console.log(`API Status: ${docResponse.status} ${docResponse.statusText}`);
    
    if (docResponse.ok) {
      const docData = await docResponse.json();
      console.log('✅ API Response:', JSON.stringify(docData, null, 2));
      
      if (docData.success && docData.data) {
        console.log('\n📋 API-Generated Document Requirements for Working Capital:');
        docData.data.forEach((doc, index) => {
          console.log(`${index + 1}. ${doc.name}`);
          if (doc.description) {
            console.log(`   Description: ${doc.description}`);
          }
          if (doc.quantity) {
            console.log(`   Quantity: ${doc.quantity}`);
          }
        });
        
        console.log(`\n📊 Document Source: ${docData.source || 'API'}`);
        if (docData.message) {
          console.log(`📝 Message: ${docData.message}`);
        }
      }
    } else {
      const errorText = await docResponse.text();
      console.log('❌ API Error:', errorText);
    }

    // Also test if there's a specific AccordAccess or Accord endpoint
    console.log('\n🏛️ Testing Lender-Specific Documents...');
    const lenderSpecificEndpoints = [
      'accord',
      'accordaccess',
      'working_capital_accord'
    ];

    for (const endpoint of lenderSpecificEndpoints) {
      try {
        const response = await fetch(`http://localhost:5000/api/loan-products/required-documents/${endpoint}`);
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${endpoint}: ${data.success ? `${data.data?.length || 0} documents` : 'No data'}`);
        } else {
          console.log(`❌ ${endpoint}: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint}: Error`);
      }
    }

  } catch (error) {
    console.error('🚨 Test Error:', error.message);
  }

  console.log('\n' + '=' * 60);
  console.log('🎯 AccordAccess Document Requirements Test Complete');
}

// Run the test
testAccordAccessDocuments().catch(console.error);