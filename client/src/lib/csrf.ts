/**
 * CSRF token handling for secure submissions
 */

export async function ensureCsrf() {
  const seen = sessionStorage.getItem("csrf:bootstrapped");
  if (seen) return;
  
  try {
    await fetch(`${import.meta.env.VITE_STAFF_API || ''}/csrf-token`, { 
      credentials: "include" 
    });
    sessionStorage.setItem("csrf:bootstrapped", "1");
  } catch (error) {
    console.warn('CSRF bootstrap failed:', error);
  }
}