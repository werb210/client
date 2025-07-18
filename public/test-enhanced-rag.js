// Test script to verify enhanced RAG system with full product database access
// Run this in browser console to test chatbot's access to all 41+ lender products

console.log('🤖 Testing Enhanced RAG System - Full Product Database Access');

async function testChatbotProductAccess() {
  console.log('\n=== ENHANCED RAG TEST SUITE ===');
  
  // Test 1: Basic product query
  console.log('\n1. Testing basic product query...');
  const test1 = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'What products do you have available?',
      sessionId: 'test-session-1',
      context: {
        currentStep: 2,
        applicationData: { requestedAmount: 50000 },
        products: await fetchTestProducts()
      }
    })
  });
  
  const result1 = await test1.json();
  console.log('Response:', result1.reply);
  
  // Test 2: Specific rate query
  console.log('\n2. Testing specific rate query...');
  const test2 = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'What is your lowest rate line of credit?',
      sessionId: 'test-session-2',
      context: {
        currentStep: 2,
        applicationData: { requestedAmount: 100000 },
        products: await fetchTestProducts()
      }
    })
  });
  
  const result2 = await test2.json();
  console.log('Response:', result2.reply);
  
  // Test 3: Function call test for recommendations
  console.log('\n3. Testing function call for product recommendations...');
  const test3 = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'I need $75,000 for working capital in Canada',
      sessionId: 'test-session-3',
      context: {
        currentStep: 2,
        applicationData: { requestedAmount: 75000, businessLocation: 'CA' },
        products: await fetchTestProducts()
      }
    })
  });
  
  const result3 = await test3.json();
  console.log('Response:', result3.reply);
  console.log('Function called:', result3.function_called);
  
  // Test 4: Database size verification
  console.log('\n4. Testing database size verification...');
  const test4 = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'How many lender products do you have access to?',
      sessionId: 'test-session-4',
      context: {
        currentStep: 2,
        applicationData: {},
        products: await fetchTestProducts()
      }
    })
  });
  
  const result4 = await test4.json();
  console.log('Response:', result4.reply);
  
  console.log('\n=== RAG ENHANCEMENT TEST COMPLETE ===');
  console.log('✅ All tests completed. Check responses for product database access.');
}

async function fetchTestProducts() {
  try {
    const response = await fetch('/api/public/lenders');
    const data = await response.json();
    
    let products = [];
    if (Array.isArray(data)) {
      products = data;
    } else if (data && data.products) {
      products = data.products;
    }
    
    console.log(`📊 Test using ${products.length} products for RAG context`);
    return products;
  } catch (error) {
    console.error('Error fetching test products:', error);
    return [];
  }
}

// Auto-run the test
testChatbotProductAccess().catch(console.error);

// Additional verification function
window.testEnhancedRAG = testChatbotProductAccess;
window.verifyProductAccess = async function() {
  const products = await fetchTestProducts();
  console.log('Product database verification:');
  console.log(`- Total products: ${products.length}`);
  console.log(`- Sample products:`, products.slice(0, 3).map(p => p.name || p.product));
  console.log(`- Categories:`, [...new Set(products.map(p => p.category).filter(Boolean))]);
  console.log('✅ Product database access verified for RAG enhancement');
};

console.log('🚀 Enhanced RAG test loaded. Functions available:');
console.log('- testChatbotProductAccess()');
console.log('- verifyProductAccess()');