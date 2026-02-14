const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
const DEFAULT_TIMEOUT_MS = 15000;

export class FetchRequestError extends Error {
  constructor(
    message: string,
    public status?: number,
    public timedOut = false
  ) {
    super(message);
  }
}

function buildHeaders(headers?: HeadersInit) {
  const normalized = new Headers(headers || {});
  if (!normalized.has("Content-Type")) {
    normalized.set("Content-Type", "application/json");
  }
  return normalized;
}

export async function safeFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: { timeoutMs?: number }
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options?.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(input, {
      credentials: "include",
      ...init,
      headers: buildHeaders(init?.headers),
      signal: controller.signal,
    });

    if (response.status === 401) {
      if (typeof window !== "undefined") {
        window.location.assign("/apply/step-1");
      }
      throw new FetchRequestError("Unauthorized. Please restart at step 1.", 401);
    }

    return response;
  } catch (error) {
    if (error instanceof FetchRequestError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new FetchRequestError("Request timed out.", undefined, true);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: { maxAttempts?: number; timeoutMs?: number }
) {
  const maxAttempts = Math.max(1, options?.maxAttempts ?? 2);
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      const response = await safeFetch(input, init, { timeoutMs: options?.timeoutMs });
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
