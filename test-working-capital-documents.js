/**
 * Test Working Capital Document Requirements
 * Tests what documents are required when user selects working capital
 */

async function testWorkingCapitalDocuments() {
  console.log('📄 Testing Working Capital Document Requirements');
  console.log('=' * 50);

  try {
    // Test the document requirements API endpoint
    const response = await fetch('http://localhost:5000/api/loan-products/required-documents/working_capital');
    
    console.log(`API Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:', JSON.stringify(data, null, 2));
      
      if (data.success && data.data) {
        console.log('\n📋 Required Documents for Working Capital:');
        data.data.forEach((doc, index) => {
          console.log(`${index + 1}. ${doc.name}`);
          if (doc.description) {
            console.log(`   Description: ${doc.description}`);
          }
          if (doc.required !== undefined) {
            console.log(`   Required: ${doc.required ? 'Yes' : 'Optional'}`);
          }
        });
        
        const requiredDocs = data.data.filter(doc => doc.required !== false);
        const optionalDocs = data.data.filter(doc => doc.required === false);
        
        console.log(`\n📊 Summary: ${requiredDocs.length} required, ${optionalDocs.length} optional`);
      }
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', errorText);
    }

    // Also test the category mapping
    console.log('\n🔍 Testing category mapping...');
    console.log('Working Capital maps to document category:', 'working_capital');
    
    // Test related categories that might also apply
    const relatedCategories = ['line_of_credit', 'term_loan', 'business_line_of_credit'];
    
    for (const category of relatedCategories) {
      console.log(`\n📄 Testing related category: ${category}`);
      try {
        const categoryResponse = await fetch(`http://localhost:5000/api/loan-products/required-documents/${category}`);
        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json();
          if (categoryData.success && categoryData.data) {
            console.log(`   Documents for ${category}: ${categoryData.data.length} items`);
            categoryData.data.forEach(doc => {
              console.log(`   • ${doc.name}`);
            });
          }
        }
      } catch (error) {
        console.log(`   Error testing ${category}:`, error.message);
      }
    }

  } catch (error) {
    console.error('🚨 Test Error:', error.message);
  }

  console.log('\n' + '=' * 50);
  console.log('🎯 Working Capital Document Test Complete');
}

// Run the test
testWorkingCapitalDocuments().catch(console.error);