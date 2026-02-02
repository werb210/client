import { useSyncExternalStore } from "react";
import {
  getServiceWorkerUpdateAvailable,
  subscribeToServiceWorkerUpdates,
} from "../pwa/serviceWorker";

export function useServiceWorkerUpdate() {
  return useSyncExternalStore(
    subscribeToServiceWorkerUpdates,
    getServiceWorkerUpdateAvailable,
    getServiceWorkerUpdateAvailable
  );
}
