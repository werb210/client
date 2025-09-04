// Advanced Submit Interceptor with Complete Payload Analysis
export function installAdvancedSubmitInterceptor() {
  // Enable debug mode
  localStorage.setItem('bf:canon:debug', '1');
  
  // Intercept localStorage for autosave monitoring
  const originalSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = (key: string, value: string) => {
    if (key === 'bf:canon:v1') {
      try {
        const parsed = JSON.parse(value || '{}');
        console.log('💾 [AUTOSAVE] Canon updated:', Object.keys(parsed).length, 'fields');
      } catch (e) {
        console.log('💾 [AUTOSAVE] Canon updated:', value.length, 'chars');
      }
    }
    return originalSetItem(key, value);
  };
  
  // Intercept fetch for submit monitoring
  const originalFetch = window.fetch;
  window.fetch = async (url: any, opts: any) => {
    const isApplicationSubmit = typeof url === 'string' && 
                               /\/api\/applications$/.test(url) && 
                               opts?.method === 'POST';
    
    if (isApplicationSubmit) {
      try {
        const body = JSON.parse(opts.body || '{}');
        const canon = JSON.parse(body.application_canon || '{}');
        
        console.log('🚀 SUBMIT INTERCEPTED:');
        console.log('  📦 Body keys (' + Object.keys(body).length + '):', Object.keys(body));
        console.log('  📄 Canon keys (' + Object.keys(canon).length + '):', Object.keys(canon));
        console.log('  📋 Headers:', opts.headers);
        console.log('  🆔 Version:', body.application_canon_version || '(missing)');
        console.log('  🔍 Trace-ID:', opts.headers['X-Trace-Id'] || '(missing)');
        console.log('  📊 Schema:', opts.headers['X-App-Schema'] || '(missing)');
        console.log('  🏷️ App Version:', opts.headers['X-App-Version'] || '(missing)');
        
        // Detailed payload analysis
        analyzePayload(body, canon);
        
      } catch (e) {
        console.warn('🚨 Submit inspection error:', e);
      }
    }
    
    return originalFetch(url, opts);
  };
  
  console.log('✅ Advanced submit interceptor installed');
  console.log('📋 Monitoring: localStorage writes + API submissions');
}

function analyzePayload(body: any, canon: any) {
  const bodyStr = JSON.stringify(body);
  const canonStr = JSON.stringify(canon);
  
  console.log('🔬 PAYLOAD ANALYSIS:');
  console.log('  • Total body size:', new Blob([bodyStr]).size, 'bytes');
  console.log('  • Canon JSON size:', new Blob([canonStr]).size, 'bytes');
  console.log('  • Unique body keys:', new Set(Object.keys(body)).size);
  console.log('  • Unique canon keys:', new Set(Object.keys(canon)).size);
  
  // Check for data loss
  const flatKeys = Object.keys(body).filter(k => !['application_canon', 'application_canon_version'].includes(k));
  const canonKeys = Object.keys(canon);
  const overlap = flatKeys.filter(k => canonKeys.includes(k)).length;
  const coverage = (overlap / Math.max(flatKeys.length, 1)) * 100;
  
  console.log('  • Flat→Canon overlap:', `${overlap}/${flatKeys.length} (${coverage.toFixed(1)}%)`);
  
  if (coverage < 95) {
    console.warn('⚠️ POTENTIAL DATA LOSS DETECTED');
  }
}

// Helper: Check Step-2 business rules readiness
export function checkStep2Rules() {
  const canon = JSON.parse(localStorage.getItem('bf:canon:v1') || '{}');
  const requiredKeys = ['lookingFor', 'fundingAmount', 'businessLocation', 'fundsPurpose', 'accountsReceivableBalance'];
  
  console.log('🎯 STEP-2 BUSINESS RULES READINESS:');
  requiredKeys.forEach(key => {
    const value = canon[key];
    const present = value !== undefined && value !== null && value !== '';
    console.log(`  • ${key}: ${present ? '✅' : '❌'} = ${JSON.stringify(value)}`);
  });
  
  const readyCount = requiredKeys.filter(key => {
    const value = canon[key];
    return value !== undefined && value !== null && value !== '';
  }).length;
  
  console.log(`📊 Step-2 readiness: ${readyCount}/${requiredKeys.length} (${(readyCount/requiredKeys.length*100).toFixed(1)}%)`);
  
  return readyCount === requiredKeys.length;
}

// Helper: Check CSP/CORS status
export function checkCSPCORS() {
  console.log('🔒 CSP/CORS ANALYSIS:');
  
  // Check CSP
  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  const csp = cspMeta ? cspMeta.getAttribute('content') : 'None detected';
  console.log('  • CSP meta tag:', csp);
  
  // Check for CSP violations in console (can't read directly, but advise)
  console.log('  • CSP violations: Check browser DevTools Console for violations');
  
  // Test a simple fetch to detect CORS issues
  fetch(window.location.origin + '/api/health')
    .then(r => console.log('  • CORS test: ✅ Same-origin fetch successful'))
    .catch(e => console.log('  • CORS test: ❌ Error -', e.message));
  
  // Check current origin
  console.log('  • Origin:', window.location.origin);
  console.log('  • User agent:', navigator.userAgent.split(') ')[0] + ')');
}