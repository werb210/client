/**
 * OTP Input Sanitation and Validation Utilities
 * 
 * Provides comprehensive input cleaning and validation for OTP codes
 * with enhanced error handling for better user experience.
 */

export interface OTPValidationResult {
  isValid: boolean;
  cleanCode: string;
  error?: string;
}

export interface OTPValidationOptions {
  length?: number;
  allowAlphanumeric?: boolean;
  trimWhitespace?: boolean;
}

/**
 * Sanitize and validate OTP input
 * @param input - Raw OTP input from user
 * @param options - Validation options
 * @returns Validation result with cleaned code
 */
export function validateOTPInput(
  input: string | number | null | undefined,
  options: OTPValidationOptions = {}
): OTPValidationResult {
  const {
    length = 6,
    allowAlphanumeric = false,
    trimWhitespace = true
  } = options;

  // Handle null/undefined input
  if (input == null) {
    return {
      isValid: false,
      cleanCode: "",
      error: `Please enter the ${length}-digit code.`
    };
  }

  // Convert to string and apply initial cleaning
  let cleanCode = input.toString();
  
  if (trimWhitespace) {
    cleanCode = cleanCode.trim();
  }

  // Remove unwanted characters based on options
  if (allowAlphanumeric) {
    // Allow letters and numbers only
    cleanCode = cleanCode.replace(/[^a-zA-Z0-9]/g, "");
  } else {
    // Numbers only (default for most OTP systems)
    cleanCode = cleanCode.replace(/\D/g, "");
  }

  // Validate length
  if (cleanCode.length === 0) {
    return {
      isValid: false,
      cleanCode: "",
      error: `Please enter the ${length}-digit code.`
    };
  }

  if (cleanCode.length < length) {
    return {
      isValid: false,
      cleanCode,
      error: `Code must be ${length} digits long.`
    };
  }

  if (cleanCode.length > length) {
    // Truncate if too long
    cleanCode = cleanCode.substring(0, length);
  }

  return {
    isValid: true,
    cleanCode,
  };
}

/**
 * Sanitize email input for OTP requests
 * @param email - Raw email input
 * @returns Cleaned and normalized email
 */
export function sanitizeEmailInput(email: string | null | undefined): string {
  if (!email) return "";
  
  return email
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ""); // Remove any whitespace
}

/**
 * Enhanced error message based on error type and context
 * @param error - Error object from API call
 * @param context - Additional context for error message
 * @returns User-friendly error message
 */
export function getOTPErrorMessage(error: any, context?: string): string {
  // Check for specific error patterns
  if (error?.status === 401 || 
      error?.message?.includes("invalid") || 
      error?.message?.includes("expired") ||
      error?.message?.includes("wrong")) {
    return "Invalid or expired code. Request a new one and try again.";
  }

  if (error?.status === 429 || error?.message?.includes("rate limit")) {
    return "Too many attempts. Please wait before trying again.";
  }

  if (error?.status === 404) {
    return "Verification session not found. Please request a new code.";
  }

  if (error?.message?.includes("network") || 
      error?.message?.includes("fetch") ||
      error?.message?.includes("connection")) {
    return "Network error. Please check your connection and try again.";
  }

  if (error?.status >= 500) {
    return "Server error. Please try again in a moment.";
  }

  // Default fallback with context
  const baseMessage = "Verification failed. Please try again.";
  return context ? `${baseMessage} ${context}` : baseMessage;
}

/**
 * Validate OTP format patterns for different providers
 * @param code - Cleaned OTP code
 * @param provider - OTP provider type
 * @returns Whether code matches expected pattern
 */
export function validateOTPPattern(code: string, provider?: 'sms' | 'email' | 'totp'): boolean {
  if (!code || typeof code !== 'string') return false;

  switch (provider) {
    case 'sms':
    case 'email':
      // Most SMS/email OTPs are 4-8 digits
      return /^\d{4,8}$/.test(code);
    
    case 'totp':
      // TOTP codes are typically 6 digits
      return /^\d{6}$/.test(code);
    
    default:
      // Default: 4-8 digits
      return /^\d{4,8}$/.test(code);
  }
}

export default {
  validateOTPInput,
  sanitizeEmailInput,
  getOTPErrorMessage,
  validateOTPPattern,
};