import { useEffect } from "react";

interface BridgeResponse {
  step1: {
    industry: string;
    yearsInBusiness: string;
    annualRevenue: string;
    monthlyRevenue: string;
    arBalance: string;
    collateralAvailable: string;
  };
  step3: {
    companyName: string;
  };
  step4: {
    fullName: string;
    email: string;
    phone: string;
  };
}

export function useReadinessBridge(
  setStep1: (data: any) => void,
  setStep3: (data: any) => void,
  setStep4: (data: any) => void
) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("readiness");

    if (!token) return;

    async function fetchBridge() {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
        if (!apiBaseUrl) return;

        const res = await fetch(`${apiBaseUrl}/api/readiness/bridge/${token}`);

        if (!res.ok) return;

        const data: BridgeResponse = await res.json();

        localStorage.setItem("creditSessionToken", token);

        setStep1(data.step1);
        setStep3(data.step3);
        setStep4(data.step4);
      } catch {
        // silently fail
      }
    }

    void fetchBridge();
  }, [setStep1, setStep3, setStep4]);
}
