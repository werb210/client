export const DEFAULT_NOTIFICATION_DELAY_MS = 2 * 60 * 1000;

export type RejectionNotification = {
  documents: string[];
  notifyAt: number;
  createdAt: number;
};

export type RejectionNotificationState = {
  notifiedDocuments: string[];
  pending: RejectionNotification | null;
};

const STORAGE_PREFIX = "boreal_doc_rejection_state";

export function getRejectedDocuments(documents: any) {
  if (!documents) return [];
  if (Array.isArray(documents)) {
    return documents
      .filter((doc) => doc?.status === "rejected")
      .map((doc) => doc?.document_type || doc?.category || doc?.name)
      .filter(Boolean);
  }
  return Object.entries(documents)
    .filter(([, value]) => (value as any)?.status === "rejected")
    .map(([key]) => key);
}

export function createEmptyRejectionState(): RejectionNotificationState {
  return { notifiedDocuments: [], pending: null };
}

export function upsertRejectionState(
  state: RejectionNotificationState,
  rejectedDocuments: string[],
  now: number,
  delayMs: number
) {
  const newlyRejected = rejectedDocuments.filter(
    (doc) => !state.notifiedDocuments.includes(doc)
  );
  if (newlyRejected.length === 0) {
    return state;
  }

  if (state.pending && now < state.pending.notifyAt) {
    const merged = Array.from(
      new Set([...state.pending.documents, ...newlyRejected])
    );
    return {
      ...state,
      pending: {
        ...state.pending,
        documents: merged,
      },
    };
  }

  return {
    ...state,
    pending: {
      documents: newlyRejected,
      createdAt: now,
      notifyAt: now + delayMs,
    },
  };
}

export function consumeDueNotification(
  state: RejectionNotificationState,
  now: number
) {
  if (!state.pending || now < state.pending.notifyAt) {
    return { state, notification: null };
  }
  const notification = state.pending;
  return {
    notification,
    state: {
      notifiedDocuments: Array.from(
        new Set([...state.notifiedDocuments, ...notification.documents])
      ),
      pending: null,
    },
  };
}

export function loadRejectionState(token: string): RejectionNotificationState {
  if (!token) return createEmptyRejectionState();
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}:${token}`);
    if (!raw) return createEmptyRejectionState();
    const parsed = JSON.parse(raw);
    return {
      notifiedDocuments: Array.isArray(parsed?.notifiedDocuments)
        ? parsed.notifiedDocuments
        : [],
      pending: parsed?.pending || null,
    };
  } catch (error) {
    console.warn("Failed to load rejection state:", error);
    return createEmptyRejectionState();
  }
}

export function saveRejectionState(
  token: string,
  state: RejectionNotificationState
) {
  if (!token) return;
  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}:${token}`,
      JSON.stringify(state)
    );
  } catch (error) {
    console.warn("Failed to save rejection state:", error);
  }
}
