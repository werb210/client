/**
 * DEBUG APPLICATION FLOW
 * Run this in browser console to monitor the complete application submission process
 * Tracks form data, API calls, and error sources
 */

// Enhanced logging for application flow tracking
window.APPLICATION_DEBUG = {
  logs: [],
  trackEvent: function(step, data) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, step, data };
    this.logs.push(logEntry);
    console.log(`📋 [${timestamp}] ${step}:`, data);
  },
  
  showSummary: function() {
    console.log('📊 Application Flow Summary:');
    this.logs.forEach(log => {
      console.log(`  ${log.timestamp} - ${log.step}`);
    });
  }
};

// Monitor form submissions
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const [url, options] = args;
  window.APPLICATION_DEBUG.trackEvent('FETCH_CALL', { url, method: options?.method || 'GET' });
  
  return originalFetch.apply(this, args)
    .then(response => {
      window.APPLICATION_DEBUG.trackEvent('FETCH_RESPONSE', { 
        url, 
        status: response.status, 
        ok: response.ok 
      });
      return response;
    })
    .catch(error => {
      window.APPLICATION_DEBUG.trackEvent('FETCH_ERROR', { 
        url, 
        error: error.message 
      });
      throw error;
    });
};

// Monitor localStorage changes
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  if (key === 'applicationId') {
    window.APPLICATION_DEBUG.trackEvent('STORAGE_UPDATE', { key, value });
  }
  return originalSetItem.call(this, key, value);
};

console.log('🔍 Application flow debugging enabled. Fill out the form and submit to track the complete flow.');
console.log('📊 Use APPLICATION_DEBUG.showSummary() to see all tracked events.');