import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ClientProfileStore } from "../state/clientProfiles";
import { OfflineStore } from "../state/offline";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { clearClientStorage } from "./logout";

const SESSION_GUARD_KEY = "boreal_session_guard_reloaded";

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export type SessionGuardAction = "noop" | "reload" | "redirect";

function getSessionStorage(): StorageLike | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch (error) {
    console.warn("Failed to access session storage:", error);
    return null;
  }
}

function markReloaded(storage: StorageLike | null) {
  if (!storage) return;
  try {
    storage.setItem(SESSION_GUARD_KEY, "true");
  } catch (error) {
    console.warn("Failed to mark session reload:", error);
  }
}

function clearReloadMarker(storage: StorageLike | null) {
  if (!storage) return;
  try {
    storage.removeItem(SESSION_GUARD_KEY);
  } catch (error) {
    console.warn("Failed to clear session reload marker:", error);
  }
}

export function resolveSessionGuardAction(options: {
  isOffline: boolean;
  hasAuth: boolean;
  storage?: StorageLike | null;
}): SessionGuardAction {
  const storage = options.storage ?? null;

  if (options.isOffline) {
    return "noop";
  }

  if (options.hasAuth) {
    clearReloadMarker(storage);
    return "noop";
  }

  if (!storage) {
    return "redirect";
  }

  const hasReloaded = storage.getItem(SESSION_GUARD_KEY) === "true";
  if (!hasReloaded) {
    markReloaded(storage);
    return "reload";
  }

  return "redirect";
}

function getSessionRequirement(pathname: string, search: string) {
  if (pathname.startsWith("/status")) {
    const token = new URLSearchParams(search).get("token") || "";
    return {
      hasAuth: Boolean(token) && ClientProfileStore.hasPortalSession(token),
      redirectTo: "/portal",
    };
  }

  if (pathname.startsWith("/apply/step-")) {
    const step = Number(pathname.replace("/apply/step-", ""));
    if (!Number.isNaN(step) && step > 1) {
      const cached = OfflineStore.load();
      return {
        hasAuth: Boolean(cached?.applicationToken),
        redirectTo: "/apply/step-1",
      };
    }
  }

  return { hasAuth: true, redirectTo: "" };
}

export function useSessionGuard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOffline } = useNetworkStatus();

  const guard = useMemo(
    () => getSessionRequirement(location.pathname, location.search),
    [location.pathname, location.search]
  );

  useEffect(() => {
    const action = resolveSessionGuardAction({
      isOffline,
      hasAuth: guard.hasAuth,
      storage: getSessionStorage(),
    });

    if (action === "reload") {
      if (typeof window === "undefined") return;
      window.location.reload();
      return;
    }

    if (action === "redirect" && guard.redirectTo) {
      clearClientStorage();
      navigate(guard.redirectTo, { replace: true });
    }
  }, [guard.hasAuth, guard.redirectTo, isOffline, navigate]);
}

export function SessionGuard() {
  useSessionGuard();
  return null;
}
