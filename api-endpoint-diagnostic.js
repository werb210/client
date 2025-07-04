#!/usr/bin/env node

/**
 * API Endpoint Diagnostic Script
 * Tests all required staff backend endpoints to identify exact failure points
 */

const BASE_URL = 'https://staffportal.replit.app/api';

const endpoints = [
  { method: 'GET', path: '/health', description: 'Health check endpoint' },
  { method: 'POST', path: '/applications', description: 'Create application endpoint' },
  { method: 'POST', path: '/upload/test-app-id', description: 'Document upload endpoint' },
  { method: 'POST', path: '/applications/test-app-id/initiate-signing', description: 'Initiate signing endpoint' },
  { method: 'POST', path: '/applications/test-app-id/submit', description: 'Final submission endpoint' },
  { method: 'GET', path: '/loan-products/required-documents/working_capital', description: 'Document requirements endpoint' },
  { method: 'GET', path: '/public/lenders', description: 'Public lenders endpoint (known working)' }
];

async function testEndpoint(endpoint) {
  const url = `${BASE_URL}${endpoint.path}`;
  const options = {
    method: endpoint.method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  // Add test data for POST requests
  if (endpoint.method === 'POST') {
    options.body = JSON.stringify({ test: 'data' });
  }

  try {
    console.log(`\n🔍 Testing ${endpoint.method} ${endpoint.path}`);
    console.log(`   Description: ${endpoint.description}`);
    console.log(`   Full URL: ${url}`);
    
    const response = await fetch(url, options);
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);
    
    if (response.status === 404) {
      console.log(`   ❌ ENDPOINT NOT FOUND`);
    } else if (response.status === 501) {
      console.log(`   ⚠️ ENDPOINT EXISTS BUT NOT IMPLEMENTED`);
    } else if (response.status >= 200 && response.status < 300) {
      console.log(`   ✅ ENDPOINT WORKING`);
    } else {
      console.log(`   ⚠️ ENDPOINT EXISTS BUT RETURNED ERROR`);
    }
    
    // Try to get response body
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        const data = await response.json();
        console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
      } catch (e) {
        console.log(`   Response: Could not parse JSON`);
      }
    } else {
      try {
        const text = await response.text();
        console.log(`   Response: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
      } catch (e) {
        console.log(`   Response: Could not read response`);
      }
    }
    
    return { endpoint: endpoint.path, status: response.status, working: response.status !== 404 };
    
  } catch (error) {
    console.log(`   ❌ NETWORK ERROR: ${error.message}`);
    return { endpoint: endpoint.path, status: 'ERROR', working: false, error: error.message };
  }
}

async function runDiagnostics() {
  console.log('🔧 API Endpoint Diagnostic Test');
  console.log('================================');
  console.log(`Testing staff backend: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 SUMMARY REPORT');
  console.log('=================');
  
  const working = results.filter(r => r.working);
  const notFound = results.filter(r => r.status === 404);
  const errors = results.filter(r => r.status === 'ERROR');
  
  console.log(`✅ Working endpoints: ${working.length}/${results.length}`);
  console.log(`❌ Not found (404): ${notFound.length}`);
  console.log(`🔥 Network errors: ${errors.length}`);
  
  if (notFound.length > 0) {
    console.log('\n❌ MISSING ENDPOINTS:');
    notFound.forEach(r => console.log(`   - ${r.endpoint}`));
  }
  
  if (errors.length > 0) {
    console.log('\n🔥 ERROR ENDPOINTS:');
    errors.forEach(r => console.log(`   - ${r.endpoint}: ${r.error}`));
  }
  
  console.log('\n🎯 RECOMMENDATIONS:');
  if (notFound.length > 0) {
    console.log('   Staff backend needs to implement these missing endpoints:');
    notFound.forEach(r => console.log(`   - ${r.endpoint}`));
  }
  
  if (errors.length > 0) {
    console.log('   Network connectivity issues detected - check CORS configuration');
  }
  
  if (working.length === results.length) {
    console.log('   ✅ All endpoints working - client application should work correctly');
  }
  
  return results;
}

// Run diagnostics
runDiagnostics().catch(console.error);