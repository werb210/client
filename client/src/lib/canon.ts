export const CANON_KEY = 'bf:canon:v1';

export function readCanon(): Record<string, any> {
  try { 
    return JSON.parse(localStorage.getItem(CANON_KEY) || '{}'); 
  } catch { 
    return {}; 
  }
}