import { describe, expect, it, vi } from "vitest";
import {
  getInitialOfflineState,
  subscribeToNetworkStatus,
} from "../hooks/useNetworkStatus";

describe("network status", () => {
  it("detects initial offline state from navigator", () => {
    vi.stubGlobal("navigator", { onLine: false });
    expect(getInitialOfflineState()).toBe(true);
  });

  it("notifies subscribers on online/offline events", () => {
    const listeners = {
      online: new Set<() => void>(),
      offline: new Set<() => void>(),
    };
    const windowMock = {
      addEventListener: (event: "online" | "offline", cb: () => void) => {
        listeners[event].add(cb);
      },
      removeEventListener: (event: "online" | "offline", cb: () => void) => {
        listeners[event].delete(cb);
      },
    };

    vi.stubGlobal("window", windowMock);

    const events: boolean[] = [];
    const unsubscribe = subscribeToNetworkStatus((isOffline) => {
      events.push(isOffline);
    });

    listeners.offline.forEach((cb) => cb());
    listeners.online.forEach((cb) => cb());
    unsubscribe();

    expect(events).toEqual([true, false]);
  });
});
