const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: { maxAttempts?: number }
) {
  const maxAttempts = Math.max(1, options?.maxAttempts ?? 2);
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      const response = await fetch(input, init);
      if (response.ok || !RETRYABLE_STATUS.has(response.status) || attempt >= maxAttempts) {
        return response;
      }
    } catch (error) {
      if (attempt >= maxAttempts) {
        throw error;
      }
    }
  }

  throw new Error("Request failed after retries.");
}
