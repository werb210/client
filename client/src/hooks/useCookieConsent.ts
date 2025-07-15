import { useState, useEffect } from "react";
import Cookies from "js-cookie";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp?: string;
}

/**
 * Hook for managing cookie consent state and preferences
 * Provides utilities for checking consent and loading scripts conditionally
 */
export const useCookieConsent = () => {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has given consent
    const consentCookie = Cookies.get("borealCookieConsent");
    setHasConsent(!!consentCookie);

    // Load preferences from localStorage
    const storedPreferences = localStorage.getItem("borealCookiePreferences");
    if (storedPreferences) {
      try {
        const parsed = JSON.parse(storedPreferences);
        setPreferences({
          necessary: true, // Always true
          analytics: parsed.analytics || false,
          marketing: parsed.marketing || false,
          timestamp: parsed.timestamp,
        });
      } catch (error) {
        console.warn("[COOKIES] Failed to parse stored preferences:", error);
      }
    }
  }, []);

  // Utility functions for checking specific consent types
  const canUseAnalytics = () => hasConsent && preferences.analytics;
  const canUseMarketing = () => hasConsent && preferences.marketing;
  const canUseNecessary = () => true; // Always allowed

  // Function to load analytics scripts conditionally
  const loadAnalyticsScript = (scriptId: string, src: string, onLoad?: () => void) => {
    if (!canUseAnalytics()) {
      // console.log(`[COOKIES] Analytics blocked - not loading ${scriptId}`);
      return;
    }

    // Check if script already exists
    if (document.getElementById(scriptId)) {
      // console.log(`[COOKIES] Script ${scriptId} already loaded`);
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = src;
    script.async = true;
    script.onload = () => {
      // console.log(`[COOKIES] Loaded analytics script: ${scriptId}`);
      onLoad?.();
    };
    script.onerror = () => {
      console.error(`[COOKIES] Failed to load script: ${scriptId}`);
    };

    document.head.appendChild(script);
  };

  // Function to load marketing scripts conditionally
  const loadMarketingScript = (scriptId: string, src: string, onLoad?: () => void) => {
    if (!canUseMarketing()) {
      // console.log(`[COOKIES] Marketing blocked - not loading ${scriptId}`);
      return;
    }

    // Check if script already exists
    if (document.getElementById(scriptId)) {
      // console.log(`[COOKIES] Script ${scriptId} already loaded`);
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = src;
    script.async = true;
    script.onload = () => {
      // console.log(`[COOKIES] Loaded marketing script: ${scriptId}`);
      onLoad?.();
    };
    script.onerror = () => {
      console.error(`[COOKIES] Failed to load script: ${scriptId}`);
    };

    document.head.appendChild(script);
  };

  // Function to initialize Google Analytics
  const initGoogleAnalytics = (measurementId: string) => {
    if (!canUseAnalytics()) {
      // console.log("[COOKIES] Analytics consent not given - skipping Google Analytics");
      return;
    }

    // Load gtag script
    loadAnalyticsScript(
      "google-analytics",
      `https://www.googletagmanager.com/gtag/js?id=${measurementId}`,
      () => {
        // Initialize Google Analytics
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) {
          window.dataLayer.push(args);
        }
        
        gtag('js', new Date());
        gtag('config', measurementId, {
          anonymize_ip: true,
          cookie_flags: 'SameSite=Lax;Secure'
        });

        // console.log(`[COOKIES] Google Analytics initialized: ${measurementId}`);
      }
    );
  };

  return {
    hasConsent,
    preferences,
    canUseAnalytics,
    canUseMarketing,
    canUseNecessary,
    loadAnalyticsScript,
    loadMarketingScript,
    initGoogleAnalytics,
  };
};

// Type declaration for global dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}