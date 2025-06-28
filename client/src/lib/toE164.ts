import { parsePhoneNumberFromString } from 'libphonenumber-js';

export function toE164(raw: string): string | null {
  const p = parsePhoneNumberFromString(raw, 'US');   // default country
  return p?.isValid() ? p.number : null;             // +15878881837
}