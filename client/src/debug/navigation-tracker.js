/**
 * Navigation Tracking Debug Script
 * Run this in browser console to track all navigation changes
 * Helps identify what's causing unwanted redirects from Step 6
 */

// Track all navigation events
let navigationLog = [];

function logNavigation(source, path, reason = '') {
  const timestamp = new Date().toISOString();
  const entry = { timestamp, source, path, reason };
  navigationLog.push(entry);
  console.log(`🧭 [${timestamp}] ${source}: ${path} ${reason ? `(${reason})` : ''}`);
}

// Override setLocation function if it exists
if (window.setLocation) {
  const originalSetLocation = window.setLocation;
  window.setLocation = function(path, ...args) {
    logNavigation('setLocation override', path, 'manual call');
    return originalSetLocation.call(this, path, ...args);
  };
}

// Track window.location changes
let lastLocation = window.location.pathname;
setInterval(() => {
  if (window.location.pathname !== lastLocation) {
    logNavigation('URL change', window.location.pathname, `from: ${lastLocation}`);
    lastLocation = window.location.pathname;
  }
}, 1000);

// Track pushState/replaceState
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function(state, title, url) {
  logNavigation('history.pushState', url || window.location.pathname);
  return originalPushState.call(this, state, title, url);
};

history.replaceState = function(state, title, url) {
  logNavigation('history.replaceState', url || window.location.pathname);
  return originalReplaceState.call(this, state, title, url);
};

// Track popstate events
window.addEventListener('popstate', (event) => {
  logNavigation('popstate', window.location.pathname, 'browser back/forward');
});

// Monitor error events
window.addEventListener('error', (event) => {
  logNavigation('error event', window.location.pathname, `Error: ${event.message}`);
});

window.addEventListener('unhandledrejection', (event) => {
  logNavigation('unhandled rejection', window.location.pathname, `Promise rejection: ${event.reason}`);
});

console.log('🧭 Navigation tracker initialized');
console.log('🧭 Use window.getNavigationLog() to see all navigation events');

// Expose navigation log
window.getNavigationLog = () => {
  console.table(navigationLog);
  return navigationLog;
};

// Clear log function
window.clearNavigationLog = () => {
  navigationLog = [];
  console.log('🧭 Navigation log cleared');
};

export { logNavigation, navigationLog };