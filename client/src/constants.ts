// API Configuration Constants
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://staffportal.replit.app/api";

// Application Configuration
export const APP_CONFIG = {
  API_BASE_URL,
  SIGNNOW_REDIRECT_URL: import.meta.env.VITE_SIGNNOW_REDIRECT_URL || (typeof window !== 'undefined' ? window.location.origin + '/step6-signature' : 'http://localhost:5000/step6-signature'),
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MIN_FILE_SIZE: 5 * 1024, // 5KB
  REQUEST_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  IS_PRODUCTION: import.meta.env.PROD,
  SECURE_COOKIES: import.meta.env.PROD,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
};