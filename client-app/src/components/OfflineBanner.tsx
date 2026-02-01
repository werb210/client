import { useEffect, useState } from "react";
import { tokens } from "@/styles";

export function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    function onDown() {
      setOffline(true);
    }
    function onUp() {
      setOffline(false);
    }
    window.addEventListener("offline", onDown);
    window.addEventListener("online", onUp);
    return () => {
      window.removeEventListener("offline", onDown);
      window.removeEventListener("online", onUp);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      style={{
        background: "rgba(245, 158, 11, 0.35)",
        color: tokens.colors.textPrimary,
        padding: "8px 16px",
        textAlign: "center",
        fontWeight: 600,
      }}
    >
      You are offline — changes will sync when connection is restored.
    </div>
  );
}
