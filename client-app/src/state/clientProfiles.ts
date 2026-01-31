const PROFILE_KEY = "boreal_client_profiles";
const LAST_PHONE_KEY = "boreal_client_last_phone";
const OTP_KEY = "boreal_client_pending_otp";
const PORTAL_SESSION_KEY = "boreal_portal_session_tokens";
const OTP_TTL_MS = 5 * 60 * 1000;

export type ClientProfile = {
  phone: string;
  applicationTokens: string[];
  lastActiveToken?: string;
  updatedAt: number;
};

type StoredOtp = {
  phone: string;
  code: string;
  createdAt: number;
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
  } catch (error) {
    console.warn("Failed to load client profiles:", error);
    return {};
  }
}

function saveProfiles(profiles: Record<string, ClientProfile>) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.warn("Failed to save client profiles:", error);
  }
}

export const ClientProfileStore = {
  normalizePhone,
  getLastUsedPhone() {
    try {
      return localStorage.getItem(LAST_PHONE_KEY) || "";
    } catch (error) {
      console.warn("Failed to read last phone:", error);
      return "";
    }
  },
  setLastUsedPhone(phone: string) {
    try {
      localStorage.setItem(LAST_PHONE_KEY, phone);
    } catch (error) {
      console.warn("Failed to save last phone:", error);
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
  upsertProfile(phone: string, token: string) {
    const key = normalizePhone(phone);
    if (!key) return null;
    const profiles = loadProfiles();
    const existing = profiles[key];
    const tokens = existing?.applicationTokens || [];
    const nextTokens = tokens.includes(token) ? tokens : [token, ...tokens];
    const profile: ClientProfile = {
      phone,
      applicationTokens: nextTokens,
      lastActiveToken: token,
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
  listTokens(phone: string) {
    const profile = this.getProfile(phone);
    return profile?.applicationTokens || [];
  },
  requestOtp(phone: string) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const payload: StoredOtp = {
      phone: normalizePhone(phone),
      code,
      createdAt: Date.now(),
    };
    try {
      localStorage.setItem(OTP_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn("Failed to store OTP:", error);
    }
    return code;
  },
  getPendingOtp(phone: string) {
    try {
      const raw = localStorage.getItem(OTP_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as StoredOtp;
      if (!parsed?.phone || !parsed?.code || !parsed?.createdAt) return null;
      if (parsed.phone !== normalizePhone(phone)) return null;
      if (Date.now() - parsed.createdAt > OTP_TTL_MS) {
        localStorage.removeItem(OTP_KEY);
        return null;
      }
      return parsed;
    } catch (error) {
      console.warn("Failed to read OTP:", error);
      return null;
    }
  },
  verifyOtp(phone: string, code: string) {
    const pending = this.getPendingOtp(phone);
    if (!pending) return false;
    const match = pending.code === code;
    if (match) {
      try {
        localStorage.removeItem(OTP_KEY);
      } catch (error) {
        console.warn("Failed to clear OTP:", error);
      }
    }
    return match;
  },
  markPortalVerified(token: string) {
    if (!token) return;
    try {
      const raw = sessionStorage.getItem(PORTAL_SESSION_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(parsed) ? parsed : [];
      if (!list.includes(token)) {
        sessionStorage.setItem(
          PORTAL_SESSION_KEY,
          JSON.stringify([token, ...list])
        );
      }
    } catch (error) {
      console.warn("Failed to store portal session:", error);
    }
  },
  hasPortalSession(token: string) {
    if (!token) return false;
    try {
      const raw = sessionStorage.getItem(PORTAL_SESSION_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) && parsed.includes(token);
    } catch (error) {
      console.warn("Failed to read portal session:", error);
      return false;
    }
  },
};
