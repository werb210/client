import {
  loadPortalSessions,
  savePortalSessions,
  clearPortalSessions as clearPortalSessionsStorage,
  type PortalSession,
} from "./portalSessions";
const PROFILE_KEY = "boreal_client_profiles";
const LAST_PHONE_KEY = "boreal_client_last_phone";
const PORTAL_SESSION_KEY = "boreal_portal_session_token";
const PORTAL_SESSION_TTL_MS = 5 * 60 * 1000;

export type ClientProfile = {
  phone: string;
  applicationTokens: string[];
  lastActiveToken?: string;
  submittedTokens?: string[];
  lastSubmittedToken?: string;
  updatedAt: number;
};


function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function loadProfiles(): Record<string, ClientProfile> {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

function saveProfiles(profiles: Record<string, ClientProfile>) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
  } catch {
  }
}

function getSessionStorage() {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      return window.sessionStorage;
    }
    if (typeof globalThis !== "undefined" && "sessionStorage" in globalThis) {
      return globalThis.sessionStorage as Storage;
    }
    return null;
  } catch {
    return null;
  }
}

function setPortalSessionToken(token: string) {
  const storage = getSessionStorage();
  if (!storage) return;
  try {
    storage.setItem(PORTAL_SESSION_KEY, token);
  } catch {
  }
}

function getPortalSessionToken() {
  const storage = getSessionStorage();
  if (!storage) return "";
  try {
    return storage.getItem(PORTAL_SESSION_KEY) || "";
  } catch {
    return "";
  }
}

function clearPortalSessionToken() {
  const storage = getSessionStorage();
  if (!storage) return;
  try {
    storage.removeItem(PORTAL_SESSION_KEY);
  } catch {
  }
}

export const ClientProfileStore = {
  normalizePhone,
  getLastUsedPhone() {
    try {
      return localStorage.getItem(LAST_PHONE_KEY) || "";
    } catch {
      return "";
    }
  },
  setLastUsedPhone(phone: string) {
    try {
      localStorage.setItem(LAST_PHONE_KEY, phone);
    } catch {
    }
  },
  getProfile(phone: string) {
    const key = normalizePhone(phone);
    const profiles = loadProfiles();
    return profiles[key] || null;
  },
  hasAnyProfile() {
    const profiles = loadProfiles();
    return Object.keys(profiles).length > 0;
  },
  hasSubmittedProfile() {
    const profiles = loadProfiles();
    return Object.values(profiles).some(
      (profile) => (profile.submittedTokens || []).length > 0
    );
  },
  upsertProfile(phone: string, token: string) {
    const key = normalizePhone(phone);
    if (!key) return null;
    const profiles = loadProfiles();
    const existing = profiles[key];
    const tokens = existing?.applicationTokens || [];
    const submittedTokens = existing?.submittedTokens || [];
    const nextTokens = tokens.includes(token) ? tokens : [token, ...tokens];
    const profile: ClientProfile = {
      phone,
      applicationTokens: nextTokens,
      lastActiveToken: token,
      submittedTokens,
      lastSubmittedToken: existing?.lastSubmittedToken,
      updatedAt: Date.now(),
    };
    profiles[key] = profile;
    saveProfiles(profiles);
    this.setLastUsedPhone(phone);
    return profile;
  },
  markSubmitted(phone: string, token: string) {
    const key = normalizePhone(phone);
    if (!key || !token) return null;
    const profiles = loadProfiles();
    const existing = profiles[key];
    const tokens = existing?.applicationTokens || [];
    const submittedTokens = existing?.submittedTokens || [];
    const nextTokens = tokens.includes(token) ? tokens : [token, ...tokens];
    const nextSubmitted = submittedTokens.includes(token)
      ? submittedTokens
      : [token, ...submittedTokens];
    const profile: ClientProfile = {
      phone,
      applicationTokens: nextTokens,
      lastActiveToken: token,
      submittedTokens: nextSubmitted,
      lastSubmittedToken: token,
      updatedAt: Date.now(),
    };
    profiles[key] = profile;
    saveProfiles(profiles);
    this.setLastUsedPhone(phone);
    return profile;
  },
  getLatestToken(phone: string) {
    const profile = this.getProfile(phone);
    if (!profile) return "";
    return profile.lastActiveToken || profile.applicationTokens[0] || "";
  },
  getLatestSubmittedToken(phone: string) {
    const profile = this.getProfile(phone);
    if (!profile) return "";
    return (
      profile.lastSubmittedToken ||
      profile.submittedTokens?.[0] ||
      ""
    );
  },
  listTokens(phone: string) {
    const profile = this.getProfile(phone);
    return profile?.applicationTokens || [];
  },
  markPortalVerified(token: string) {
    if (!token) return;
    const list = loadPortalSessions();
    const now = Date.now();
    const next = list
      .filter((entry: PortalSession) => entry?.expiresAt > now)
      .filter((entry: PortalSession) => entry?.token !== token);
    next.unshift({
      token,
      verifiedAt: now,
      expiresAt: now + PORTAL_SESSION_TTL_MS,
    });
    savePortalSessions(next);
    setPortalSessionToken(token);
  },
  hasPortalSession(token: string) {
    if (!token) return false;
    const sessionToken = getPortalSessionToken();
    if (!sessionToken || sessionToken !== token) {
      return false;
    }
    const parsed = loadPortalSessions();
    const now = Date.now();
    const next = parsed.filter(
      (entry: PortalSession) => entry?.token && entry?.expiresAt > now
    );
    if (next.length !== parsed.length) {
      savePortalSessions(next);
    }
    return next.some((entry: PortalSession) => entry.token === token);
  },
  clearPortalSessions() {
    void clearPortalSessionsStorage();
    clearPortalSessionToken();
  },
  clearAll() {
    try {
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(LAST_PHONE_KEY);
    } catch {
    }
    this.clearPortalSessions();
  },
};
