import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Consent from "@/components/Consent";
import { Shield, User, FileText } from "lucide-react";

export default function PrivacyComplianceDemo() {
  const [contactId, setContactId] = useState("demo-contact-123");
  const [showConsent, setShowConsent] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Privacy & Compliance Demo
          </h1>
          <p className="text-gray-600">
            Demonstration of KYC verification and consent management features
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* KYC Mock Demo */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <User className="w-6 h-6 text-teal-600" />
                <CardTitle>KYC Verification Mock</CardTitle>
              </div>
              <p className="text-sm text-gray-600">
                Simulated Know Your Customer verification process
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-id">Contact ID</Label>
                <Input
                  id="contact-id"
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  placeholder="Enter contact ID"
                />
              </div>

              <Button
                onClick={() => window.open(`/client/kyc/mock?contact=${contactId}`, '_blank')}
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={!contactId}
              >
                <Shield className="w-4 h-4 mr-2" />
                Open KYC Verification
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  Opens the KYC mock interface where you can simulate approval or rejection
                  of identity verification for the specified contact.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Consent Widget Demo */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-teal-600" />
                <CardTitle>Consent Management</CardTitle>
              </div>
              <p className="text-sm text-gray-600">
                Interactive privacy consent preferences
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setShowConsent(!showConsent)}
                variant={showConsent ? "outline" : "default"}
                className="w-full"
              >
                {showConsent ? "Hide" : "Show"} Consent Widget
              </Button>

              {showConsent && (
                <Consent 
                  contactId={contactId}
                  onSaved={() => {
                    alert("Privacy preferences saved successfully!");
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Testing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-gray-600" />
              Testing & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">KYC Testing</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Mock approval/rejection flows</li>
                  <li>• Contact ID validation</li>
                  <li>• Error handling</li>
                  <li>• API integration testing</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Consent Management</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Terms & conditions consent</li>
                  <li>• Marketing preferences</li>
                  <li>• Privacy policy acknowledgment</li>
                  <li>• Persistent storage</li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-800 mb-2">Testing Instructions</h4>
              <p className="text-amber-700 text-sm">
                Run Playwright tests with: <code className="bg-amber-100 px-1 rounded">npx playwright test tests/data-protection.spec.ts</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}