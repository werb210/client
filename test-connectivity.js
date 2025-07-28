// Test Staff Backend Connectivity
console.log("🔍 TESTING STAFF BACKEND CONNECTIVITY");

async function testStaffBackend() {
  const endpoints = [
    '/api/public/lenders',
    '/api/public/client-ip'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\n🧪 Testing: ${endpoint}`);
      const response = await fetch(`http://localhost:5000${endpoint}`);
      
      console.log(`Status: ${response.status} ${response.statusText}`);
      const data = await response.text();
      console.log(`Response: ${data.substring(0, 200)}...`);
      
    } catch (error) {
      console.error(`❌ Error testing ${endpoint}:`, error.message);
    }
  }
}

testStaffBackend();