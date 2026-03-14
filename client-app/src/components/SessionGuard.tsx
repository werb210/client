import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";

type SessionGuardProps = {
  children: ReactNode;
};

const SESSION_KEY = "client_session";
const WAIT_FOR_SESSION_MS = 1200;

export default function SessionGuard({ children }: SessionGuardProps) {
  const [resolved, setResolved] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const readToken = () => {
      const token = typeof window !== "undefined" ? window.localStorage.getItem(SESSION_KEY) : null;
      return Boolean(token);
    };

    const settle = () => {
      if (cancelled) {
        return;
      }
      setHasToken(readToken());
      setResolved(true);
    };

    if (readToken()) {
      settle();
      return () => {
        cancelled = true;
      };
    }

    const timer = window.setTimeout(settle, WAIT_FOR_SESSION_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  if (!resolved) {
    return <div className="py-20 text-center">Loading...</div>;
  }

  if (!hasToken) {
    return <Navigate to="/otp" replace />;
  }

  return <>{children}</>;
}
