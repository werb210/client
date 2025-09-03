/**
 * Document upload utility for submitting files to staff backend
 * Uses the exact contract specification with field name "files" (plural)
 */

// Helper function to get CSRF token if present
function getCsrfTokenIfAny(): string | undefined {
  // Try to get CSRF token from meta tag, cookie, or other source
  const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (metaToken) return metaToken;
  
  // Try to get from cookie
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf-token' || name === '_csrf') {
      return value;
    }
  }
  
  return undefined;
}

/**
 * Upload documents to staff backend for a specific submission
 * @param submissionId - The application submission ID
 * @param files - Array of files to upload
 * @returns Promise resolving to the upload response
 */
export async function uploadDocs(submissionId: string, files: File[]) {
  const form = new FormData();
  
  // Append each file with field name "files" (plural) as specified in contract
  files.forEach(file => form.append("files", file));
  
  // Build headers object
  const headers: Record<string, string> = {};
  const csrfToken = getCsrfTokenIfAny();
  if (csrfToken) {
    headers["x-csrf-token"] = csrfToken;
  }
  
  const res = await fetch(
    `${import.meta.env.VITE_STAFF_API_BASE}/v1/applications/${submissionId}/docs`, 
    {
      method: "POST",
      body: form,
      credentials: "include",
      headers
    }
  );
  
  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`);
  }
  
  return res.json();
}