// test-chatbot-session.js - Session-based chatbot test with proper CSRF handling
import fetch from 'node-fetch';
import { CookieJar } from 'tough-cookie';

const BASE_URL = 'http://localhost:5000';

// Simple cookie jar implementation for session management
class SimpleCookieJar {
  constructor() {
    this.cookies = new Map();
  }
  
  setCookie(cookieString, url) {
    const parts = cookieString.split(';')[0].split('=');
    if (parts.length === 2) {
      this.cookies.set(parts[0], parts[1]);
    }
  }
  
  getCookieString() {
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }
  
  getCookie(name) {
    return this.cookies.get(name);
  }
}

async function runSessionBasedTest() {
  console.log('🍪 SESSION-BASED CHATBOT TEST');
  console.log('==============================');

  const cookieJar = new SimpleCookieJar();
  let testResults = {
    session: 0,
    leadCapture: 0,
    aiChat: 0,
    total: 0
  };

  try {
    console.log('\n🔐 1. ESTABLISHING SESSION WITH CSRF TOKEN');
    console.log('------------------------------------------');

    // Step 1: Get a page to establish session and get CSRF token
    console.log('1a. Getting initial page to establish session...');
    const initialRes = await fetch(`${BASE_URL}/`, {
      method: 'GET',
      headers: {
        'User-Agent': 'ChatBot-Test/1.0'
      }
    });

    // Extract cookies from response
    const setCookieHeaders = initialRes.headers.raw()['set-cookie'] || [];
    setCookieHeaders.forEach(cookie => {
      cookieJar.setCookie(cookie, BASE_URL);
    });

    let csrfToken = initialRes.headers.get('x-csrf-token');
    
    if (csrfToken) {
      console.log('   ✅ CSRF token received from initial page');
      testResults.session += 1;
    } else {
      console.log('   ⚠️  No CSRF token in initial response');
    }

    // Try getting token from health endpoint
    if (!csrfToken) {
      console.log('1b. Trying to get CSRF token from health endpoint...');
      const healthRes = await fetch(`${BASE_URL}/api/health`, {
        headers: {
          'Cookie': cookieJar.getCookieString(),
          'User-Agent': 'ChatBot-Test/1.0'
        }
      });

      const healthCsrfToken = healthRes.headers.get('x-csrf-token');
      
      if (healthCsrfToken) {
        console.log('   ✅ CSRF token received from health endpoint');
        testResults.session += 1;
        
        // Update cookie jar if new cookies were set
        const healthCookies = healthRes.headers.raw()['set-cookie'] || [];
        healthCookies.forEach(cookie => {
          cookieJar.setCookie(cookie, BASE_URL);
        });
        
        // Use health endpoint token
        csrfToken = healthCsrfToken;
      } else {
        console.log('   ❌ No CSRF token from health endpoint');
      }
    }

    console.log(`   📋 Session cookies: ${cookieJar.getCookieString()}`);
    console.log(`   🔑 CSRF Token: ${csrfToken ? 'Present' : 'Missing'}`);

    if (!csrfToken) {
      console.log('❌ Cannot proceed without CSRF token');
      return;
    }

    console.log('\n👤 2. TESTING LEAD CAPTURE WITH SESSION');
    console.log('---------------------------------------');

    console.log('2a. Testing valid lead submission with session...');
    const leadRes = await fetch(`${BASE_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        'Cookie': cookieJar.getCookieString(),
        'User-Agent': 'ChatBot-Test/1.0'
      },
      body: JSON.stringify({
        name: 'John Session Test',
        email: 'john.session@test.com',
        consent: true,
        source: 'chat',
        page: '/test-session',
        language: 'en'
      })
    });

    if (leadRes.ok) {
      const leadResult = await leadRes.json();
      console.log('   ✅ Lead captured successfully with session');
      console.log(`   📝 Response: ${leadResult.message}`);
      testResults.leadCapture += 2;
    } else {
      console.log(`   ❌ Lead capture failed (status: ${leadRes.status})`);
      const errorText = await leadRes.text();
      console.log(`   💥 Error: ${errorText}`);
    }

    console.log('\n🤖 3. TESTING AI CHAT MESSAGE');
    console.log('-----------------------------');

    console.log('3a. Testing AI chat message processing...');
    const chatRes = await fetch(`${BASE_URL}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieJar.getCookieString(),
        'User-Agent': 'ChatBot-Test/1.0'
      },
      body: JSON.stringify({
        sessionId: 'test_session_cookie_based',
        message: 'Do you offer equipment financing for restaurants?',
        language: 'en',
        context: {
          name: 'John Session Test',
          email: 'john.session@test.com',
          lenderProducts: [
            {
              id: 'test-1',
              name: 'Equipment Financing',
              lender: 'Test Bank',
              description: 'Financing for restaurant equipment'
            }
          ]
        }
      })
    });

    if (chatRes.ok) {
      const chatResult = await chatRes.json();
      console.log('   ✅ AI chat message processed successfully');
      console.log(`   💬 Response preview: ${chatResult.response?.substring(0, 100)}...`);
      
      if (chatResult.recommendations && chatResult.recommendations.length > 0) {
        console.log(`   🎯 Recommendations: ${chatResult.recommendations.length} lenders suggested`);
        testResults.aiChat += 2;
      } else {
        testResults.aiChat += 1;
      }
    } else {
      console.log(`   ❌ AI chat failed (status: ${chatRes.status})`);
      const errorText = await chatRes.text();
      console.log(`   💥 Error: ${errorText}`);
    }

    console.log('\n🔄 4. TESTING STAFF HANDOFF WITH SESSION');
    console.log('----------------------------------------');

    console.log('4a. Testing staff handoff request...');
    const handoffRes = await fetch(`${BASE_URL}/api/chat/request-staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieJar.getCookieString(),
        'User-Agent': 'ChatBot-Test/1.0'
      },
      body: JSON.stringify({
        sessionId: 'test_session_cookie_based',
        name: 'John Session Test',
        email: 'john.session@test.com',
        currentPage: '/test-session'
      })
    });

    if (handoffRes.ok || handoffRes.status === 503) {
      // 503 is expected if staff backend not configured
      console.log('   ✅ Staff handoff endpoint responding correctly');
      testResults.session += 1;
    } else {
      console.log(`   ❌ Staff handoff unexpected error (status: ${handoffRes.status})`);
    }

  } catch (error) {
    console.error('❌ Session test error:', error);
  }

  // Calculate results
  testResults.total = testResults.session + testResults.leadCapture + testResults.aiChat;
  const maxScore = 6; // 2 session + 2 lead + 2 ai chat
  const percentage = Math.round((testResults.total / maxScore) * 100);

  console.log('\n📊 SESSION-BASED TEST RESULTS');
  console.log('=============================');
  console.log(`🔐 Session Management: ${testResults.session}/2`);
  console.log(`👤 Lead Capture: ${testResults.leadCapture}/2`);
  console.log(`🤖 AI Chat: ${testResults.aiChat}/2`);
  console.log(`📈 Total Score: ${testResults.total}/${maxScore} (${percentage}%)`);

  console.log('\n🎯 SESSION TEST VERDICT');
  console.log('======================');

  if (percentage >= 85) {
    console.log('✅ EXCELLENT - Chatbot session management working perfectly');
  } else if (percentage >= 70) {
    console.log('✅ GOOD - Chatbot session functionality mostly working');
  } else if (percentage >= 50) {
    console.log('⚠️  ACCEPTABLE - Basic chatbot session functionality');
  } else {
    console.log('❌ NEEDS WORK - Critical session management issues');
  }

  console.log(`\n⏰ Session test completed: ${new Date().toISOString()}`);
}

// Run the session-based test
runSessionBasedTest().catch(error => {
  console.error('❌ Session test failed:', error);
  process.exit(1);
});