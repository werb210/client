import { useSyncExternalStore } from "react";
import {
  isSessionRefreshing,
  subscribeSessionRefresh,
} from "../state/sessionRefresh";

export function useSessionRefreshing() {
  return useSyncExternalStore(
    subscribeSessionRefresh,
    isSessionRefreshing,
    isSessionRefreshing
  );
}
