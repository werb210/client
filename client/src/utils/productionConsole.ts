/**
 * Production Console Override
 * Completely disables all console output for true production deployment
 */

// Store original console methods for development
const originalConsole = {
  log: console.log,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
  error: console.error
};

/**
 * Enable production mode console suppression
 * Disables ALL console output except critical errors
 */
export function enableProductionConsole() {
  // Disable all non-critical console output
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
  console.debug = () => {};
  
  // Keep only critical errors for production monitoring
  console.error = (...args: any[]) => {
    // Only log genuine application errors, not development noise
    const message = args.join(' ').toLowerCase();
    if (message.includes('critical') || message.includes('fatal') || message.includes('server')) {
      originalConsole.error(...args);
    }
  };
}

/**
 * Restore original console for development
 */
export function restoreOriginalConsole() {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
  console.error = originalConsole.error;
}

/**
 * Auto-detect and apply production console settings
 */
export function autoConfigureConsole() {
  // Force production console in all environments for clean deployment
  enableProductionConsole();
  
  // Additional global error suppression for third-party scripts
  window.addEventListener('error', (event) => {
    const source = event.filename || '';
    const message = event.message || '';
    
    // Suppress beacon.js and other third-party tracking errors
    if (source.includes('beacon') || 
        source.includes('tracking') || 
        source.includes('analytics') ||
        message.includes('beacon') ||
        message.includes('replit')) {
      event.preventDefault();
      return false;
    }
  });
}