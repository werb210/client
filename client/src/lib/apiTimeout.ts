/**
 * C-6: Mobile network resilience - API timeout configuration
 */

// Timeout configuration for different request types
export const API_TIMEOUTS = {
  GET: 8000,     // 8 seconds for GET requests
  POST: 15000,   // 15 seconds for POST requests (mobile network resilience)
  PUT: 15000,    // 15 seconds for PUT requests
  DELETE: 10000, // 10 seconds for DELETE requests
};

/**
 * Create fetch with appropriate timeout based on method
 */
export function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase();
  const timeout = API_TIMEOUTS[method as keyof typeof API_TIMEOUTS] || API_TIMEOUTS.GET;
  
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) => {
      const timeoutId = setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout);
      return timeoutId;
    })
  ]);
}