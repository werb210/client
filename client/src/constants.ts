/**
 * Application Constants
 * 
 * Centralized configuration for API endpoints and other constants
 */

// API Configuration - Development uses direct server connection, production uses relative path
export const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:5000/api'  // Direct to Express server in development (Vite proxy workaround)
  : (import.meta.env.VITE_API_BASE_URL || '/api'); // Production uses environment variable or relative path

// Staff API Configuration
export const STAFF_API_BASE_URL = API_BASE_URL;

// Production Environment Check
export const IS_PRODUCTION = import.meta.env.PROD;

// Development Environment Check
export const IS_DEVELOPMENT = import.meta.env.DEV;

// API Endpoints
export const API_ENDPOINTS = {
  LENDER_PRODUCTS: '/api/loan-products',
  REQUIRED_DOCUMENTS: '/api/loan-products/required-documents',
  APPLICATIONS: '/api/applications',
  UPLOAD: '/api/upload'
} as const;

// Document Categories
export const DOCUMENT_CATEGORIES = {
  EQUIPMENT_FINANCING: 'equipment_financing',
  TERM_LOAN: 'term_loan',
  LINE_OF_CREDIT: 'line_of_credit',
  INVOICE_FACTORING: 'invoice_factoring',
  WORKING_CAPITAL: 'working_capital',
  PURCHASE_ORDER_FINANCING: 'purchase_order_financing'
} as const;

// Country Codes
export const COUNTRY_CODES = {
  US: 'US',
  CA: 'CA'
} as const;

// Validation Constants
export const VALIDATION = {
  MIN_FUNDING_AMOUNT: 5000,
  MAX_FUNDING_AMOUNT: 5000000,
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
} as const;

// App Configuration
export const APP_CONFIG = {
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  API_BASE_URL,
  STAFF_API_BASE_URL
} as const;