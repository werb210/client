/**
 * Test script to check lender products count
 * Run this in browser console to see exact product count
 */

async function testProductsCount() {
  try {
    console.log('🧪 Testing lender products count...');
    
    // Test API endpoint directly
    const response = await fetch('/api/public/lenders');
    console.log(`API Response: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    console.log('Raw API Response:', data);
    console.log('Response type:', typeof data);
    console.log('Response keys:', Object.keys(data || {}));
    
    // Check different possible structures
    if (Array.isArray(data)) {
      console.log(`✅ Direct array: ${data.length} products`);
      return data.length;
    } else if (data && typeof data === 'object') {
      if (data.products && Array.isArray(data.products)) {
        console.log(`✅ Nested products array: ${data.products.length} products`);
        return data.products.length;
      } else if (data.data && Array.isArray(data.data)) {
        console.log(`✅ Nested data array: ${data.data.length} products`);
        return data.data.length;
      } else if (data.count !== undefined) {
        console.log(`✅ Count field: ${data.count} products`);
        return data.count;
      } else {
        console.log('❌ Unknown data structure:', data);
        return 0;
      }
    } else {
      console.log('❌ Invalid response type:', typeof data);
      return 0;
    }
  } catch (error) {
    console.error('❌ Error testing products:', error);
    return 0;
  }
}

// Run the test
testProductsCount().then(count => {
  console.log(`\n🎯 FINAL RESULT: ${count} lender products available`);
});