// Single source of truth for staff API endpoint
let _staffApiUrl: string | null = null;

export function getStaffApiUrl(): string {
  if (_staffApiUrl === null) {
    const url = import.meta.env.VITE_STAFF_API_URL;
    
    if (!url) {
      throw new Error('VITE_STAFF_API_URL environment variable is required');
    }
    
    // Validate the URL format
    try {
      new URL(url);
    } catch {
      throw new Error(`Invalid VITE_STAFF_API_URL: ${url}`);
    }
    
    _staffApiUrl = url;
  }
  
  return _staffApiUrl;
}

// For backward compatibility, use getter pattern
export const STAFF_API = new Proxy({}, {
  get(target, prop) {
    if (prop === 'toString' || prop === Symbol.toPrimitive || prop === 'valueOf') {
      return () => getStaffApiUrl();
    }
    return getStaffApiUrl()[prop as keyof string];
  }
}) as string;