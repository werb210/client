export type PortalSession = {
  token: string;
  verifiedAt: number;
  expiresAt: number;
};

const STORAGE_KEY = "boreal_portal_session_tokens";
const DB_NAME = "boreal_client";
const STORE_NAME = "portal_sessions";
const STORE_KEY = "sessions";

let cachedSessions: PortalSession[] | null = null;

function normalizeSessions(parsed: unknown): PortalSession[] {
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(
    (entry) =>
      entry &&
      typeof entry.token === "string" &&
      typeof entry.expiresAt === "number"
  );
}

function parseSessions(raw: string | null): PortalSession[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return normalizeSessions(parsed);
  } catch (error) {
    console.warn("Failed to parse portal sessions:", error);
    return [];
  }
}

function getIndexedDb(): IDBFactory | null {
  if (typeof indexedDB === "undefined") return null;
  return indexedDB;
}

function openPortalDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const factory = getIndexedDb();
    if (!factory) {
      reject(new Error("IndexedDB unavailable"));
      return;
    }
    const request = factory.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readSessionsFromIndexedDb(): Promise<PortalSession[] | null> {
  if (!getIndexedDb()) return null;
  try {
    const db = await openPortalDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(STORE_KEY);
      request.onsuccess = () => resolve(normalizeSessions(request.result));
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    console.warn("Failed to read portal sessions from IndexedDB:", error);
    return null;
  }
}

async function writeSessionsToIndexedDb(sessions: PortalSession[]) {
  if (!getIndexedDb()) return;
  try {
    const db = await openPortalDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      const store = tx.objectStore(STORE_NAME);
      store.put(sessions, STORE_KEY);
    });
  } catch (error) {
    console.warn("Failed to persist portal sessions to IndexedDB:", error);
  }
}

async function clearSessionsFromIndexedDb() {
  if (!getIndexedDb()) return;
  try {
    const db = await openPortalDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(STORE_NAME).delete(STORE_KEY);
    });
  } catch (error) {
    console.warn("Failed to clear portal sessions from IndexedDB:", error);
  }
}

export function loadPortalSessions(): PortalSession[] {
  if (cachedSessions) return cachedSessions;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const sessions = parseSessions(raw);
    cachedSessions = sessions;
    return sessions;
  } catch (error) {
    console.warn("Failed to read portal sessions:", error);
    cachedSessions = [];
    return [];
  }
}

export function savePortalSessions(sessions: PortalSession[]) {
  cachedSessions = sessions;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.warn("Failed to store portal sessions:", error);
  }
  void writeSessionsToIndexedDb(sessions);
}

export async function hydratePortalSessionsFromIndexedDb() {
  const sessions = await readSessionsFromIndexedDb();
  if (!sessions) return;
  savePortalSessions(sessions);
}

export async function clearPortalSessions() {
  cachedSessions = [];
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear portal sessions:", error);
  }
  await clearSessionsFromIndexedDb();
}
