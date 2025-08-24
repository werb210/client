// server/test-security.ts - Quick security verification script
import { app } from "./app";
import { harden } from "./security";
import { setupSecureRoutes } from "./routes/secure";

// Apply security and routes
harden(app);
setupSecureRoutes(app);

const PORT = 3333; // Use different port for testing

const server = app.listen(PORT, () => {
  console.log(`🧪 [TEST] Security test server running on port ${PORT}`);
  testSecurityEndpoints();
});

async function testSecurityEndpoints() {
  const base = `http://localhost:${PORT}`;
  
  console.log('\n🔒 Running Security Tests...\n');
  
  // Test 1: Health check
  try {
    const healthRes = await fetch(`${base}/api/health`);
    const healthData = await healthRes.json();
    console.log('✅ Health Check:', healthData.ok ? 'PASS' : 'FAIL');
  } catch (err) {
    console.log('❌ Health Check: FAIL -', err);
  }
  
  // Test 2: Invalid application data (should be rejected)
  try {
    const invalidApp = await fetch(`${base}/api/public/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: 'data' })
    });
    console.log('✅ Input Validation:', invalidApp.status === 422 ? 'PASS' : 'FAIL');
  } catch (err) {
    console.log('❌ Input Validation: FAIL -', err);
  }
  
  // Test 3: Valid application data structure (should accept)
  try {
    const validApp = await fetch(`${base}/api/public/applications`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        step4: {
          firstName: 'John',
          lastName: 'Doe', 
          email: 'john@example.com',
          applicantEmail: 'john@example.com',
          phone: '1234567890',
          applicantPhone: '1234567890'
        }
      })
    });
    console.log('✅ Valid Data Format:', validApp.status !== 422 ? 'PASS' : 'FAIL');
  } catch (err) {
    console.log('❌ Valid Data Format: FAIL -', err);
  }
  
  // Test 4: Invalid chat message (should be rejected)
  try {
    const invalidChat = await fetch(`${base}/api/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalidField: 'test' })
    });
    console.log('✅ Chat Validation:', invalidChat.status === 422 ? 'PASS' : 'FAIL');
  } catch (err) {
    console.log('❌ Chat Validation: FAIL -', err);
  }
  
  // Test 5: File upload validation
  try {
    const invalidFile = await fetch(`${base}/api/uploads/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileBase64: 'invalid' })
    });
    console.log('✅ File Validation:', invalidFile.status === 400 ? 'PASS' : 'FAIL');
  } catch (err) {
    console.log('❌ File Validation: FAIL -', err);
  }
  
  console.log('\n🔒 Security tests completed!');
  server.close();
}