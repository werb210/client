export const API_BASE_URL = ((import.meta as any).env?.VITE_STAFF_API_BASE ?? "").trim();

// Strict runtime guard: only allow the official Staff API host over HTTPS
const allowedHost = "staff.boreal.financial";
try {
  const u = new URL(API_BASE_URL);
  if (u.protocol !== "https:" || u.hostname !== allowedHost) {
    throw new Error(`Invalid API host: ${u.hostname}. Expected ${allowedHost} over HTTPS.`);
  }
} catch (e) {
  throw new Error(
    `VITE_STAFF_API_BASE is invalid or missing. Set it to 'https://staff.boreal.financial/api'. Original error: ${String(e)}`
  );
}
Object.freeze((globalThis as any).API_BASE_URL);

export async function apiFetch(input: string, init?: RequestInit) {
  const url = input.startsWith("/") ? `${API_BASE_URL}${input}` : input;
  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    credentials: "include",
  });
}