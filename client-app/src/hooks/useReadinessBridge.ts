import { useEffect } from "react";

export function useReadinessBridge(
  setStep1: Function,
  setStep3: Function,
  setStep4: Function
) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("readiness");

    if (!token) return;

    async function fetchBridge() {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/readiness/bridge/${token}`
      );

      if (!res.ok) return;

      const data = await res.json();

      setStep1(data.step1);
      setStep3(data.step3);
      setStep4(data.step4);

      localStorage.setItem("creditSessionToken", token);
    }

    void fetchBridge();
  }, []);
}
