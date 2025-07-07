import CookieConsent from "react-cookie-consent";
import { Link } from "wouter";

/**
 * GDPR/CCPA-compliant cookie consent banner
 * Appears at bottom of screen until user accepts
 * Stores consent in localStorage and cookie for 180 days
 */
export const CookieNotice = () => {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Accept All Cookies"
      cookieName="borealCookieConsent"
      style={{ 
        background: "#003D7A", // Boreal Financial navy blue
        color: "#ffffff",
        fontSize: "14px",
        padding: "20px",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
        zIndex: 9999
      }}
      buttonStyle={{ 
        color: "#ffffff", 
        background: "#FF8C00", // Boreal Financial orange
        borderRadius: "6px",
        border: "none",
        padding: "12px 24px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "background-color 0.2s"
      }}
      declineButtonText="Decline Optional"
      enableDeclineButton
      declineButtonStyle={{
        color: "#003D7A",
        background: "transparent",
        border: "2px solid #ffffff",
        borderRadius: "6px",
        padding: "10px 20px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        marginRight: "12px"
      }}
      expires={180} // 180 days
      onAccept={() => {
        console.log("[COOKIES] User accepted all cookies");
        // Store consent choices in localStorage for detailed tracking
        localStorage.setItem("borealCookiePreferences", JSON.stringify({
          necessary: true,
          analytics: true,
          marketing: true,
          timestamp: new Date().toISOString()
        }));
      }}
      onDecline={() => {
        console.log("[COOKIES] User declined optional cookies");
        // Store minimal consent (necessary only)
        localStorage.setItem("borealCookiePreferences", JSON.stringify({
          necessary: true,
          analytics: false,
          marketing: false,
          timestamp: new Date().toISOString()
        }));
      }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex-1">
          <p className="mb-2">
            <strong>We value your privacy.</strong> We use cookies to enhance your browsing experience, 
            analyze site traffic, and provide secure application functionality.
          </p>
          <p className="text-sm opacity-90">
            Necessary cookies are required for core functionality. Optional cookies help us improve our services.{" "}
            <Link href="/privacy-policy" className="underline hover:no-underline">
              Learn more about our Privacy Policy
            </Link>
            {" "}or{" "}
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('openCookieSettings'))}
              className="underline hover:no-underline bg-transparent border-none p-0 text-white cursor-pointer"
            >
              manage your preferences
            </button>
            .
          </p>
        </div>
      </div>
    </CookieConsent>
  );
};