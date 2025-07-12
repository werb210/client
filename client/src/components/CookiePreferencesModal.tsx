import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";
import Cookies from "js-cookie";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookiePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Granular cookie preferences modal
 * Allows users to control specific cookie categories
 * Integrates with consent banner for detailed privacy control
 */
export const CookiePreferencesModal = ({ isOpen, onClose }: CookiePreferencesModalProps) => {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: true,
    marketing: true,
  });

  // Load existing preferences on open
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = localStorage.getItem("borealCookiePreferences");
        if (stored) {
          const parsed = JSON.parse(stored);
          setPreferences({
            necessary: true, // Always true
            analytics: parsed.analytics || false,
            marketing: parsed.marketing || false,
          });
        }
      } catch (error) {
        console.warn("[COOKIES] Failed to load stored preferences:", error);
      }
    }
  }, [isOpen]);

  const handleSavePreferences = () => {
    try {
      // Save to localStorage
      localStorage.setItem("borealCookiePreferences", JSON.stringify({
        ...preferences,
        timestamp: new Date().toISOString()
      }));

      // Set consent cookie
      Cookies.set("borealCookieConsent", "true", { expires: 180 });

      console.log("[COOKIES] User saved preferences:", preferences);
    } catch (error) {
      console.warn("[COOKIES] Failed to save preferences:", error);
    }
    onClose();
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    
    try {
      setPreferences(allAccepted);
      localStorage.setItem("borealCookiePreferences", JSON.stringify({
        ...allAccepted,
        timestamp: new Date().toISOString()
      }));
      
      Cookies.set("borealCookieConsent", "true", { expires: 180 });
      console.log("[COOKIES] User accepted all cookies");
    } catch (error) {
      console.warn("[COOKIES] Failed to accept all cookies:", error);
    }
    onClose();
  };

  const handleRejectOptional = () => {
    const minimalConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    
    try {
      setPreferences(minimalConsent);
      localStorage.setItem("borealCookiePreferences", JSON.stringify({
        ...minimalConsent,
        timestamp: new Date().toISOString()
      }));
      
      Cookies.set("borealCookieConsent", "true", { expires: 180 });
      console.log("[COOKIES] User rejected optional cookies");
    } catch (error) {
      console.warn("[COOKIES] Failed to reject optional cookies:", error);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#003D7A]">
            Cookie Preferences
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            We use cookies to provide you with the best possible experience on our website. 
            You can choose which categories of cookies you'd like to allow.
          </p>

          {/* Necessary Cookies */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[#003D7A]">Necessary Cookies</h3>
              <Switch 
                checked={true} 
                disabled={true}
                className="opacity-50"
              />
            </div>
            <p className="text-sm text-gray-600">
              Essential for basic website functionality, security, and user authentication. 
              These cookies cannot be disabled as they are required for the service to work properly.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Examples: Session management, security tokens, form data persistence
            </p>
          </div>

          {/* Analytics Cookies */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[#003D7A]">Analytics Cookies</h3>
              <Switch 
                checked={preferences.analytics}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, analytics: checked }))
                }
              />
            </div>
            <p className="text-sm text-gray-600">
              Help us understand how visitors interact with our website by collecting 
              anonymous information about usage patterns and performance.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Examples: Google Analytics, page views, user flow analysis
            </p>
          </div>

          {/* Marketing Cookies */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[#003D7A]">Marketing Cookies</h3>
              <Switch 
                checked={preferences.marketing}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, marketing: checked }))
                }
              />
            </div>
            <p className="text-sm text-gray-600">
              Used to deliver personalized advertisements and track the effectiveness 
              of our marketing campaigns across different platforms.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Examples: Facebook Pixel, Google Ads, retargeting pixels
            </p>
          </div>

          {/* Privacy Policy Link */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              For more detailed information about our data practices, please read our{" "}
              <Link href="/privacy-policy" className="text-[#FF8C00] hover:underline font-medium">
                Privacy Policy
              </Link>
              {" "}and{" "}
              <Link href="/terms-of-service" className="text-[#FF8C00] hover:underline font-medium">
                Terms of Service
              </Link>
              .
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button 
              onClick={handleRejectOptional}
              variant="outline"
              className="border-[#003D7A] text-[#003D7A] hover:bg-[#003D7A] hover:text-white"
            >
              Reject Optional
            </Button>
            <Button 
              onClick={handleSavePreferences}
              variant="outline"
              className="border-[#FF8C00] text-[#FF8C00] hover:bg-[#FF8C00] hover:text-white"
            >
              Save Preferences
            </Button>
            <Button 
              onClick={handleAcceptAll}
              className="bg-[#FF8C00] hover:bg-[#e67900] text-white flex-1"
            >
              Accept All Cookies
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};