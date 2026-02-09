export type UploadStateEntry = {
  uploading: boolean;
  progress: number;
};

type PersistedUploadState = {
  state: Record<string, UploadStateEntry>;
  errors: Record<string, string | null>;
  updatedAt: string;
};

const STORAGE_PREFIX = "boreal_portal_upload_state";

function getStorageKey(applicationId: string) {
  return `${STORAGE_PREFIX}:${applicationId}`;
}

function normalizeEntry(entry: Partial<UploadStateEntry> | null | undefined) {
  const progress = Number(entry?.progress ?? 0);
  return {
    uploading: Boolean(entry?.uploading),
    progress: Number.isFinite(progress)
      ? Math.max(0, Math.min(100, Math.round(progress)))
      : 0,
  };
}

export function loadUploadState(
  applicationId: string,
  storage: Storage | null
) {
  if (!applicationId || !storage) {
    return { state: {}, errors: {} };
  }
  try {
    const raw = storage.getItem(getStorageKey(applicationId));
    if (!raw) return { state: {}, errors: {} };
    const parsed = JSON.parse(raw) as PersistedUploadState;
    if (!parsed || typeof parsed !== "object") {
      return { state: {}, errors: {} };
    }
    const restoredState: Record<string, UploadStateEntry> = {};
    const restoredErrors: Record<string, string> = {};

    Object.entries(parsed.state || {}).forEach(([category, entry]) => {
      const normalized = normalizeEntry(entry as UploadStateEntry);
      if (normalized.uploading) {
        restoredState[category] = { uploading: false, progress: normalized.progress };
        restoredErrors[category] =
          parsed.errors?.[category] ||
          "Upload interrupted. Please retry this document.";
      } else {
        restoredState[category] = normalized;
      }
    });

    Object.entries(parsed.errors || {}).forEach(([category, message]) => {
      if (message && !restoredErrors[category]) {
        restoredErrors[category] = message;
      }
    });

    return { state: restoredState, errors: restoredErrors };
  } catch (error) {
    console.warn("Failed to load upload state:", error);
    return { state: {}, errors: {} };
  }
}

export function saveUploadState(
  applicationId: string,
  state: Record<string, UploadStateEntry>,
  errors: Record<string, string | null | undefined>,
  storage: Storage | null
) {
  if (!applicationId || !storage) return;
  try {
    const normalizedState: Record<string, UploadStateEntry> = {};
    Object.entries(state || {}).forEach(([category, entry]) => {
      normalizedState[category] = normalizeEntry(entry);
    });

    const normalizedErrors: Record<string, string | null> = {};
    Object.entries(errors || {}).forEach(([category, message]) => {
      normalizedErrors[category] = message ? String(message) : null;
    });

    const payload: PersistedUploadState = {
      state: normalizedState,
      errors: normalizedErrors,
      updatedAt: new Date().toISOString(),
    };
    storage.setItem(getStorageKey(applicationId), JSON.stringify(payload));
  } catch (error) {
    console.warn("Failed to save upload state:", error);
  }
}

export function clearUploadState(applicationId: string, storage: Storage | null) {
  if (!applicationId || !storage) return;
  try {
    storage.removeItem(getStorageKey(applicationId));
  } catch (error) {
    console.warn("Failed to clear upload state:", error);
  }
}
