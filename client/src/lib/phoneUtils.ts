/**
 * Phone number formatting and validation utilities using libphonenumber-js
 */
import { parsePhoneNumberFromString, formatIncompletePhoneNumber, type CountryCode } from 'libphonenumber-js';

/**
 * Normalize and validate a phone number
 * @param raw - Raw phone number input
 * @param defaultCountry - Default country code ('US' or 'CA')
 * @returns Formatted international phone number or null if invalid
 */
export function normalizePhone(raw: string, defaultCountry: CountryCode = 'US'): string | null {
  if (!raw || typeof raw !== 'string') return null;
  
  try {
    const phone = parsePhoneNumberFromString(raw, defaultCountry);
    return phone?.isValid() ? phone.number : null;
  } catch (error) {
    console.warn('Phone parsing error:', error);
    return null;
  }
}

/**
 * Format phone number for display as user types
 * @param value - Current input value
 * @param defaultCountry - Default country code ('US' or 'CA')
 * @returns Formatted phone number for display
 */
export function formatPhoneDisplay(value: string, defaultCountry: CountryCode = 'US'): string {
  if (!value) return '';
  
  try {
    // Use libphonenumber-js incomplete formatting for real-time display
    return formatIncompletePhoneNumber(value, defaultCountry);
  } catch (error) {
    // Fallback to original value if formatting fails
    return value;
  }
}

/**
 * Validate if a phone number is valid
 * @param phoneNumber - Phone number to validate
 * @param defaultCountry - Default country code ('US' or 'CA')
 * @returns true if valid, false otherwise
 */
export function isValidPhone(phoneNumber: string, defaultCountry: CountryCode = 'US'): boolean {
  if (!phoneNumber) return false;
  
  try {
    const phone = parsePhoneNumberFromString(phoneNumber, defaultCountry);
    return phone?.isValid() || false;
  } catch (error) {
    return false;
  }
}

/**
 * Get formatted phone number for display
 * @param phoneNumber - Raw phone number
 * @param defaultCountry - Default country code ('US' or 'CA')
 * @returns Formatted phone number in national format
 */
export function getDisplayPhone(phoneNumber: string, defaultCountry: CountryCode = 'US'): string {
  if (!phoneNumber) return '';
  
  try {
    const phone = parsePhoneNumberFromString(phoneNumber, defaultCountry);
    return phone?.isValid() ? phone.formatNational() : phoneNumber;
  } catch (error) {
    return phoneNumber;
  }
}

/**
 * Determine country code based on business location
 * @param businessLocation - Business location from form
 * @returns Country code for phone formatting
 */
export function getCountryFromBusinessLocation(businessLocation?: string): CountryCode {
  if (businessLocation === 'CA' || businessLocation === 'canada') return 'CA';
  return 'US'; // Default to US
}