import { useEffect, useRef } from "react";
import {
  consumeDueNotification,
  DEFAULT_NOTIFICATION_DELAY_MS,
  getRejectedDocuments,
  loadRejectionState,
  saveRejectionState,
  upsertRejectionState,
  type RejectionNotification,
  type RejectionNotificationState,
} from "../documents/rejectionNotifications";

type NotificationHandler = (notification: RejectionNotification) => void;

export function useDocumentRejectionNotifications({
  token,
  documents,
  onNotify,
  delayMs = DEFAULT_NOTIFICATION_DELAY_MS,
}: {
  token: string | null;
  documents: any;
  onNotify: NotificationHandler;
  delayMs?: number;
}) {
  const stateRef = useRef<RejectionNotificationState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!token) return;
    stateRef.current = loadRejectionState(token);
  }, [token]);

  useEffect(() => {
    if (!token || !stateRef.current) return;
    const rejectedDocs = getRejectedDocuments(documents);
    const now = Date.now();
    const nextState = upsertRejectionState(
      stateRef.current,
      rejectedDocs,
      now,
      delayMs
    );
    stateRef.current = nextState;
    saveRejectionState(token, nextState);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (nextState.pending) {
      const ms = nextState.pending.notifyAt - now;
      if (ms <= 0) {
        const { notification, state } = consumeDueNotification(
          nextState,
          Date.now()
        );
        stateRef.current = state;
        saveRejectionState(token, state);
        if (notification) onNotify(notification);
      } else {
        timerRef.current = setTimeout(() => {
          if (!stateRef.current) return;
          const { notification, state } = consumeDueNotification(
            stateRef.current,
            Date.now()
          );
          stateRef.current = state;
          saveRejectionState(token, state);
          if (notification) onNotify(notification);
        }, ms);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [delayMs, documents, onNotify, token]);
}
