type SessionRefreshListener = () => void;

let refreshing = false;
const listeners = new Set<SessionRefreshListener>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function setSessionRefreshing(next: boolean) {
  if (refreshing === next) return;
  refreshing = next;
  notify();
}

export function isSessionRefreshing() {
  return refreshing;
}

export function subscribeSessionRefresh(listener: SessionRefreshListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
