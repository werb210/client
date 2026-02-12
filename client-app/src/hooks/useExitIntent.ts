import { useEffect } from "react";

export function useExitIntent(callback: () => void) {
  useEffect(() => {
    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY <= 0) {
        callback();
      }
    }

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [callback]);
}
