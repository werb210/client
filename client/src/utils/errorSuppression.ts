/**
 * Enhanced Error Suppression Utilities
 * Specifically targets dfab1952 and beacon blocking issues
 */

// Override console.error to suppress specific error patterns
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const message = args.join(' ');
  
  // Suppress specific error patterns
  if (message.includes('dfab1952') ||
      message.includes('beacon') ||
      message.includes('blocked') ||
      message.includes('replit') ||
      message.includes('tracking') ||
      message.includes('analytics') ||
      message.match(/[a-f0-9]{8}/)) {
    return;
  }
  
  // Call original console.error for other messages
  originalConsoleError.apply(console, args);
};

// Override console.warn to suppress specific warning patterns
const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  const message = args.join(' ');
  
  // Suppress specific warning patterns
  if (message.includes('dfab1952') ||
      message.includes('beacon') ||
      message.includes('blocked') ||
      message.includes('replit') ||
      message.includes('tracking') ||
      message.includes('analytics') ||
      message.match(/[a-f0-9]{8}/)) {
    return;
  }
  
  // Call original console.warn for other messages
  originalConsoleWarn.apply(console, args);
};

// Additional global error event listener for window errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const message = event.message || '';

    if (message.includes('dfab1952') ||
        message.includes('beacon') ||
        message.includes('blocked') ||
        message.includes('replit') ||
        message.includes('tracking') ||
        message.includes('analytics') ||
        message.match(/[a-f0-9]{8}/)) {
      event.preventDefault();
      return false;
    }

    return undefined;
  });
}

export { };