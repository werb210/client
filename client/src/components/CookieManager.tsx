import { useState, useEffect } from "react";
import { CookieNotice } from "./CookieNotice";
import { CookiePreferencesModal } from "./CookiePreferencesModal";
import Cookies from "js-cookie";

/**
 * Main cookie consent management component
 * Handles showing/hiding consent banner and preferences modal
 * Listens for custom events to open preferences modal
 */
export const CookieManager = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = Cookies.get("borealCookieConsent");
    
    // Show banner only if no consent has been given
    setShowBanner(!hasConsent);

    // Listen for custom event to open preferences modal
    const handleOpenCookieSettings = () => {
      setShowPreferencesModal(true);
    };

    window.addEventListener('openCookieSettings', handleOpenCookieSettings);

    return () => {
      window.removeEventListener('openCookieSettings', handleOpenCookieSettings);
    };
  }, []);

  // Hide banner when consent is given
  useEffect(() => {
    const checkConsent = () => {
      const hasConsent = Cookies.get("borealCookieConsent");
      if (hasConsent) {
        setShowBanner(false);
      }
    };

    // Check consent status periodically
    const interval = setInterval(checkConsent, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {showBanner && <CookieNotice />}
      <CookiePreferencesModal 
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
      />
    </>
  );
};