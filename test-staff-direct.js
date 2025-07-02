// Direct test of staff API endpoint
async function testStaffAPI() {
  console.log('Testing Staff API directly...\n');
  
  const url = 'https://staffportal.replit.app/api/public/lenders';
  
  try {
    console.log(`🔄 Fetching: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (direct-test)'
      }
    });
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`📋 Headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log(`📄 Raw Response: ${responseText}`);
    
    if (response.status === 200) {
      try {
        const data = JSON.parse(responseText);
        console.log('\n✅ SUCCESS - JSON parsed successfully');
        console.log(`📊 Data type: ${typeof data}`);
        console.log(`📊 Is array: ${Array.isArray(data)}`);
        
        if (Array.isArray(data)) {
          console.log(`📊 Array length: ${data.length}`);
          if (data.length > 0) {
            console.log(`📋 Sample item:`, JSON.stringify(data[0], null, 2));
          }
        } else if (data.products) {
          console.log(`📊 Products array length: ${data.products.length}`);
          if (data.products.length > 0) {
            console.log(`📋 Sample product:`, JSON.stringify(data.products[0], null, 2));
          }
        } else {
          console.log(`📊 Object keys:`, Object.keys(data));
        }
        
        return data;
      } catch (parseError) {
        console.log('❌ JSON Parse Error:', parseError.message);
        return null;
      }
    } else if (response.status === 404) {
      console.log('❌ 404 - Route not registered on staff backend');
      return null;
    } else if (response.status === 500) {
      console.log('❌ 500 - Server error, check staff backend logs');
      try {
        const errorData = JSON.parse(responseText);
        console.log('📋 Error details:', errorData);
      } catch (e) {
        console.log('📋 Raw error response:', responseText);
      }
      return null;
    } else {
      console.log(`❌ Unexpected status: ${response.status}`);
      return null;
    }
    
  } catch (error) {
    console.log('❌ Network/Fetch Error:', error.message);
    return null;
  }
}

testStaffAPI().then(result => {
  if (result) {
    console.log('\n🎉 Staff API is working and returned data!');
  } else {
    console.log('\n💔 Staff API is not returning valid lender products');
    console.log('Next steps:');
    console.log('1. Check staff backend deployment status');
    console.log('2. Verify staff database has products');
    console.log('3. Check staff backend logs for errors');
  }
});