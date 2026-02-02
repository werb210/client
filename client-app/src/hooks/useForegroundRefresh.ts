import { useEffect } from "react";

export function useForegroundRefresh(onVisible: () => void, deps: any[] = []) {
  useEffect(() => {
    if (typeof document === "undefined") return;

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        onVisible();
      }
    }

    window.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleVisibility);
    return () => {
      window.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleVisibility);
    };
  }, deps);
}
