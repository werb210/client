/**
 * CSRF token handling for secure submissions
 */

export async function ensureCsrf() {
  if (sessionStorage.getItem("csrf:ok")) return;
  await fetch(`${import.meta.env.VITE_STAFF_API}/csrf-token`, { credentials: "include" });
  sessionStorage.setItem("csrf:ok", "1");
}