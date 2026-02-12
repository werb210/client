import { Buffer } from "buffer";

export type ClientSession = {
  submissionId: string;
  accessToken: string;
  issuedAt: number;
  expiresAt: number;
  revokedAt: number | null;
};

export type ClientSessionState = "valid" | "expired" | "revoked";

const STORAGE_KEY = "boreal_client_sessions";
const ACTIVE_SESSION_KEY = "boreal_active_client_session";
const DEFAULT_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

let cachedSessions: ClientSession[] | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function decodeBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    return window.atob(padded);
  }
  return Buffer.from(padded, "base64").toString("utf-8");
}

function parseJwtExpiry(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(decodeBase64Url(parts[1]));
    if (payload && typeof payload.exp === "number") {
      return payload.exp * 1000;
    }
  } catch (error) {
    console.warn("Failed to parse session token expiry:", error);
  }
  return null;
}

function normalizeSession(entry: any): ClientSession | null {
  if (!entry || typeof entry !== "object") return null;
  if (typeof entry.submissionId !== "string") return null;
  if (typeof entry.accessToken !== "string") return null;
  if (typeof entry.issuedAt !== "number") return null;
  if (typeof entry.expiresAt !== "number") return null;
  return {
    submissionId: entry.submissionId,
    accessToken: entry.accessToken,
    issuedAt: entry.issuedAt,
    expiresAt: entry.expiresAt,
    revokedAt: typeof entry.revokedAt === "number" ? entry.revokedAt : null,
  };
}

function loadSessions(): ClientSession[] {
  if (cachedSessions) return cachedSessions;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cachedSessions = [];
      return cachedSessions;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      cachedSessions = [];
      return cachedSessions;
    }
    cachedSessions = parsed
      .map((entry) => normalizeSession(entry))
      .filter((entry): entry is ClientSession => entry !== null);
    return cachedSessions;
  } catch (error) {
    console.warn("Failed to load client sessions:", error);
    cachedSessions = [];
    return cachedSessions;
  }
}

function saveSessions(next: ClientSession[]) {
  cachedSessions = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn("Failed to save client sessions:", error);
  }
  notify();
}

export function subscribeClientSessions(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getClientSessionState(
  session: ClientSession,
  now: number = Date.now()
): ClientSessionState {
  if (session.revokedAt) return "revoked";
  if (session.expiresAt <= now) return "expired";
  return "valid";
}

export function isClientSessionValid(
  session: ClientSession,
  now: number = Date.now()
) {
  return getClientSessionState(session, now) === "valid";
}

export function getClientSessionByToken(accessToken: string) {
  if (!accessToken) return null;
  const sessions = loadSessions();
  return sessions.find((session) => session.accessToken === accessToken) || null;
}

export function getClientSessionBySubmissionId(submissionId: string) {
  if (!submissionId) return null;
  const sessions = loadSessions();
  return (
    sessions.find((session) => session.submissionId === submissionId) || null
  );
}

export function ensureClientSession(params: {
  submissionId: string;
  accessToken: string;
  issuedAt?: number;
  expiresAt?: number | null;
  revokedAt?: number | null;
}) {
  const existing = getClientSessionByToken(params.accessToken);
  if (existing) return existing;

  const issuedAt = params.issuedAt ?? Date.now();
  const parsedExpiry = parseJwtExpiry(params.accessToken);
  const expiresAt =
    params.expiresAt ??
    parsedExpiry ??
    issuedAt + DEFAULT_SESSION_TTL_MS;
  const session: ClientSession = {
    submissionId: params.submissionId,
    accessToken: params.accessToken,
    issuedAt,
    expiresAt,
    revokedAt: params.revokedAt ?? null,
  };

  upsertClientSession(session);
  return session;
}

export function upsertClientSession(session: ClientSession) {
  const sessions = loadSessions();
  const filtered = sessions.filter(
    (entry) =>
      entry.submissionId !== session.submissionId &&
      entry.accessToken !== session.accessToken
  );
  saveSessions([session, ...filtered]);
}

export function updateClientSession(
  accessToken: string,
  patch: Partial<ClientSession>
) {
  const session = getClientSessionByToken(accessToken);
  if (!session) return null;
  const next: ClientSession = {
    ...session,
    ...patch,
  };
  upsertClientSession(next);
  return next;
}

export function markClientSessionRevoked(
  accessToken: string,
  revokedAt: number = Date.now()
) {
  return updateClientSession(accessToken, { revokedAt });
}

export function markClientSessionExpired(
  accessToken: string,
  expiresAt: number = Date.now()
) {
  return updateClientSession(accessToken, { expiresAt });
}

export function setActiveClientSessionToken(token: string) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(ACTIVE_SESSION_KEY, token);
  } catch (error) {
    console.warn("Failed to set active client session:", error);
  }
}

export function clearActiveClientSessionToken() {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch (error) {
    console.warn("Failed to clear active client session:", error);
  }
}

export function getActiveClientSessionToken() {
  if (typeof sessionStorage === "undefined") return "";
  try {
    return sessionStorage.getItem(ACTIVE_SESSION_KEY) || "";
  } catch (error) {
    console.warn("Failed to read active client session:", error);
    return "";
  }
}

export function getClientSessionAuthHeader() {
  const activeToken = getActiveClientSessionToken();
  if (!activeToken) return {};
  const session =
    getClientSessionByToken(activeToken) ||
    ensureClientSession({
      submissionId: activeToken,
      accessToken: activeToken,
    });
  if (!isClientSessionValid(session)) {
    return {};
  }
  return { Authorization: `Bearer ${session.accessToken}` };
}
