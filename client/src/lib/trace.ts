export function getTraceId() {
  try {
    return crypto.randomUUID?.() || Math.random().toString(36).slice(2);
  } catch { 
    return Math.random().toString(36).slice(2);
  }
}