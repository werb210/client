/**
 * Authentication utility functions
 * Extracted from legacy auth system to support components that still need basic error checking
 */

export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export function isNetworkError(error: Error): boolean {
  return error.message.includes('NetworkError') || 
         error.message.includes('Failed to fetch') ||
         error.message.includes('ERR_NETWORK');
}

export function isCorsError(error: Error): boolean {
  return error.message.includes('CORS') ||
         error.message.includes('Cross-Origin Request Blocked');
}