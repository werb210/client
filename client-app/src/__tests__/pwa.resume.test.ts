import { beforeEach, describe, expect, it } from "vitest";
import { hydratePortalSessionsFromIndexedDb, loadPortalSessions } from "../state/portalSessions";

class MemoryStorage {
  private store = new Map<string, string>();

  getItem(key: string) {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }

  removeItem(key: string) {
    this.store.delete(key);
  }
}

function createIndexedDbMock(initial: any) {
  let storeValue = initial;
  const db = {
    objectStoreNames: {
      contains: () => true,
    },
    createObjectStore: () => {},
    transaction: () => {
      const transaction: any = {
        oncomplete: null,
        onerror: null,
      };
      transaction.objectStore = () => ({
        get: () => {
          const request: any = { result: storeValue, onsuccess: null, onerror: null };
          queueMicrotask(() => request.onsuccess?.());
          return request;
        },
        put: (value: any) => {
          storeValue = value;
          if (transaction.oncomplete) {
            queueMicrotask(() => transaction.oncomplete());
          }
        },
        delete: () => {
          storeValue = null;
          if (transaction.oncomplete) {
            queueMicrotask(() => transaction.oncomplete());
          }
        },
      });
      return transaction;
    },
  };

  return {
    open: () => {
      const request: any = {
        result: db,
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
      };
      queueMicrotask(() => {
        request.onupgradeneeded?.();
        request.onsuccess?.();
      });
      return request;
    },
  };
}

describe("PWA session resume", () => {
  beforeEach(() => {
    globalThis.localStorage = new MemoryStorage() as Storage;
    globalThis.indexedDB = createIndexedDbMock([
      { token: "token-abc", verifiedAt: 1, expiresAt: Date.now() + 10000 },
    ]) as unknown as IDBFactory;
  });

  it("hydrates portal sessions from IndexedDB", async () => {
    await hydratePortalSessionsFromIndexedDb();
    const sessions = loadPortalSessions();
    expect(sessions[0]?.token).toBe("token-abc");
  });
});
