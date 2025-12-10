import { useEffect, useState } from "react";

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
    <div className="bg-yellow-300 text-black p-2 text-center">
      You are offline — changes will sync when connection is restored.
    </div>
  );
}
