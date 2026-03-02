const SUBMISSION_IDEMPOTENCY_KEY = "client:submission:idempotency";

export function getOrCreateSubmissionIdempotencyKey(
  storage: Storage | null = typeof window !== "undefined" ? window.localStorage : null
): string | null {
  if (!storage) return null;
  try {
    const existing = storage.getItem(SUBMISSION_IDEMPOTENCY_KEY);
    if (existing) return existing;
    const next =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `idem_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    storage.setItem(SUBMISSION_IDEMPOTENCY_KEY, next);
    return next;
  } catch {
    return null;
  }
}

export function clearSubmissionIdempotencyKey(
  storage: Storage | null = typeof window !== "undefined" ? window.localStorage : null
): void {
  if (!storage) return;
  try {
    storage.removeItem(SUBMISSION_IDEMPOTENCY_KEY);
  } catch {
    // no-op
  }
}
