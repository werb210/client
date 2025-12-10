import { OfflineStore } from "../state/offline";

export function useTokenGuard() {
  const cached = OfflineStore.load();
  return cached?.applicationToken || null;
}
