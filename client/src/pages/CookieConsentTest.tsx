import { useState } from "react";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react";
import Cookies from "js-cookie";

/**
 * Cookie Consent Testing Interface
 * Allows testing and verification of GDPR/CCPA compliance features
 */
export function CookieConsentTest() {
  const {
    hasConsent,
    preferences,
    canUseAnalytics,
    canUseMarketing,
    canUseNecessary,
    initGoogleAnalytics,
  } = useCookieConsent();

  const [testResults, setTestResults] = useState<any[]>([]);

  const addTestResult = (test: string, result: boolean, details: string) => {
    setTestResults(prev => [...prev, {
      test,
      result,
      details,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runConsentTests = () => {
    setTestResults([]);
    
    // Test 1: Cookie existence
    const consentCookie = Cookies.get("borealCookieConsent");
    addTestResult(
      "Cookie Existence", 
      !!consentCookie, 
      consentCookie ? "Consent cookie found" : "No consent cookie"
    );

    // Test 2: localStorage preferences
    const storedPrefs = localStorage.getItem("borealCookiePreferences");
    addTestResult(
      "Stored Preferences", 
      !!storedPrefs, 
      storedPrefs ? "Preferences stored in localStorage" : "No stored preferences"
    );

    // Test 3: Consent permissions
    addTestResult("Necessary Cookies", canUseNecessary(), "Always allowed");
    addTestResult("Analytics Cookies", canUseAnalytics(), preferences.analytics ? "Allowed" : "Blocked");
    addTestResult("Marketing Cookies", canUseMarketing(), preferences.marketing ? "Allowed" : "Blocked");

    // Test 4: Parse stored data
    if (storedPrefs) {
      try {
        const parsed = JSON.parse(storedPrefs);
        addTestResult(
          "Preference Parsing", 
          true, 
          `Analytics: ${parsed.analytics}, Marketing: ${parsed.marketing}`
        );
      } catch (error) {
        addTestResult("Preference Parsing", false, "Failed to parse stored preferences");
      }
    }
  };

  const clearConsent = () => {
    Cookies.remove("borealCookieConsent");
    localStorage.removeItem("borealCookiePreferences");
    setTestResults([]);
    window.location.reload(); // Reload to show banner again
  };

  const simulateAnalyticsLoad = () => {
    if (canUseAnalytics()) {
      console.log("[TEST] Loading analytics script simulation");
      addTestResult("Analytics Script Load", true, "Script would be loaded (simulated)");
    } else {
      console.log("[TEST] Analytics blocked");
      addTestResult("Analytics Script Load", false, "Script blocked by consent preferences");
    }
  };

  const openCookieSettings = () => {
    window.dispatchEvent(new CustomEvent('openCookieSettings'));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-[#FF8C00] hover:text-[#e67900] mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-[#003D7A] mb-2">Cookie Consent Testing</h1>
          <p className="text-gray-600">
            Test and verify GDPR/CCPA compliance features for Boreal Financial
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Consent Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#003D7A]">
                {hasConsent ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Consent Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="font-medium">Overall Consent</p>
                <p className={`text-sm ${hasConsent ? 'text-green-600' : 'text-red-600'}`}>
                  {hasConsent ? 'User has given consent' : 'No consent provided'}
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-medium">Cookie Categories</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Necessary:</span>
                    <span className="text-green-600">✓ Always Allowed</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Analytics:</span>
                    <span className={preferences.analytics ? 'text-green-600' : 'text-red-600'}>
                      {preferences.analytics ? '✓ Allowed' : '✗ Blocked'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketing:</span>
                    <span className={preferences.marketing ? 'text-green-600' : 'text-red-600'}>
                      {preferences.marketing ? '✓ Allowed' : '✗ Blocked'}
                    </span>
                  </div>
                </div>
              </div>

              {preferences.timestamp && (
                <div className="space-y-2">
                  <p className="font-medium">Last Updated</p>
                  <p className="text-sm text-gray-600">
                    {new Date(preferences.timestamp).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#003D7A]">Test Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={runConsentTests}
                className="w-full bg-[#FF8C00] hover:bg-[#e67900]"
              >
                Run Consent Tests
              </Button>

              <Button 
                onClick={simulateAnalyticsLoad}
                variant="outline"
                className="w-full border-[#003D7A] text-[#003D7A] hover:bg-[#003D7A] hover:text-white"
              >
                Test Analytics Loading
              </Button>

              <Button 
                onClick={openCookieSettings}
                variant="outline"
                className="w-full border-[#FF8C00] text-[#FF8C00] hover:bg-[#FF8C00] hover:text-white"
              >
                Open Cookie Settings
              </Button>

              <Button 
                onClick={clearConsent}
                variant="destructive"
                className="w-full"
              >
                Clear Consent (Show Banner)
              </Button>
            </CardContent>
          </Card>

          {/* Test Results */}
          {testResults.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#003D7A]">
                  <Clock className="h-5 w-5" />
                  Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border ${
                        result.result 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{result.test}</span>
                        <span className="text-sm text-gray-500">{result.timestamp}</span>
                      </div>
                      <p className={`text-sm mt-1 ${
                        result.result ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {result.result ? '✓' : '✗'} {result.details}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Implementation Guide */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-[#003D7A]">Implementation Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-[#003D7A]">GDPR/CCPA Compliance</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>✓ Granular cookie categories</li>
                    <li>✓ User preference management</li>
                    <li>✓ Consent withdrawal capability</li>
                    <li>✓ Privacy policy integration</li>
                    <li>✓ Data retention controls</li>
                    <li>✓ Geo-aware (future enhancement)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 text-[#003D7A]">Technical Features</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>✓ React Hook integration</li>
                    <li>✓ localStorage persistence</li>
                    <li>✓ 180-day cookie expiration</li>
                    <li>✓ Script loading controls</li>
                    <li>✓ Analytics gating</li>
                    <li>✓ Marketing script management</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-[#003D7A] mb-2">Quick Links</h4>
                <div className="flex flex-wrap gap-4 text-sm">
                  <Link href="/privacy-policy" className="text-[#FF8C00] hover:underline">
                    Privacy Policy
                  </Link>
                  <Link href="/terms-of-service" className="text-[#FF8C00] hover:underline">
                    Terms of Service
                  </Link>
                  <button 
                    onClick={openCookieSettings}
                    className="text-[#FF8C00] hover:underline"
                  >
                    Cookie Settings
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}