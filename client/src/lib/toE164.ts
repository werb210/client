// ARCHIVED: SMS utility functions for simplified auth
// import { parsePhoneNumberFromString } from 'libphonenumber-js';

// export function toE164(raw: string): string | null {
//   const p = parsePhoneNumberFromString(raw, 'US');   // default country
//   return p?.isValid() ? p.number : null;             // +15878881837
// }

// Placeholder function for backward compatibility
export function toE164(raw: string): string | null {
  // ARCHIVED: Phone number validation disabled
  return null;
}