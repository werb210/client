import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  clearActiveClientSessionToken,
  ensureClientSession,
  getClientSessionByToken,
  getClientSessionState,
  setActiveClientSessionToken,
  subscribeClientSessions,
  updateClientSession,
  type ClientSession,
  type ClientSessionState,
} from "@/state/clientSession";

type UseClientSessionResult = {
  session: ClientSession | null;
  state: ClientSessionState | "missing";
  isTerminal: boolean;
};

function getTokenFromSearch(search: string) {
  return new URLSearchParams(search).get("token");
}

export function useClientSession(tokenOverride?: string | null): UseClientSessionResult {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useMemo(
    () => tokenOverride ?? getTokenFromSearch(location.search),
    [location.search, tokenOverride]
  );
  const [session, setSession] = useState<ClientSession | null>(() => {
    if (!token) return null;
    return (
      getClientSessionByToken(token) ||
      ensureClientSession({ submissionId: token, accessToken: token })
    );
  });
  const [state, setState] = useState<ClientSessionState | "missing">(() => {
    if (!token) return "missing";
    return session ? getClientSessionState(session) : "missing";
  });

  useEffect(() => {
    if (!token) {
      clearActiveClientSessionToken();
      setSession(null);
      setState("missing");
      return;
    }
    setActiveClientSessionToken(token);
    const next =
      getClientSessionByToken(token) ||
      ensureClientSession({ submissionId: token, accessToken: token });
    setSession(next);
    setState(getClientSessionState(next));
  }, [token]);

  useEffect(() => {
    const unsubscribe = subscribeClientSessions(() => {
      if (!token) return;
      const next = getClientSessionByToken(token);
      if (!next) return;
      setSession(next);
      setState(getClientSessionState(next));
    });

    return () => {
      unsubscribe();
    };
  }, [token]);

  useEffect(() => {
    if (state === "expired") {
      navigate("/expired", { replace: true });
    } else if (state === "revoked") {
      navigate("/revoked", { replace: true });
    }
  }, [navigate, state]);

  useEffect(() => {
    if (!token || !session) return;
    if (session.submissionId !== token) {
      updateClientSession(token, { submissionId: token });
    }
  }, [session, token]);

  return {
    session,
    state,
    isTerminal: state === "expired" || state === "revoked",
  };
}

