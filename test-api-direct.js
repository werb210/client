/**
 * Direct API Test - Test the staff API endpoint directly
 */

console.log('🧪 Testing staff API directly...');

fetch("https://staffportal.replit.app/api/public/lenders")
  .then(r => {
    console.log('📡 Response status:', r.status);
    console.log('📡 Response headers:', [...r.headers.entries()]);
    return r.json();
  })
  .then(data => {
    console.log('📦 Full API Response:', data);
    console.log('✅ Success:', data.success);
    console.log('📊 Products array:', Array.isArray(data.products));
    console.log('🔢 Product count:', data.count);
    console.log('📋 Actual products length:', data.products ? data.products.length : 'undefined');
    
    if (data.products && data.products.length > 0) {
      console.log('🎉 LIVE DATA DETECTED - Should sync to client');
    } else {
      console.log('⚠️ Empty products array - staff database is empty');
    }
  })
  .catch(err => {
    console.error('❌ API Error:', err);
  });