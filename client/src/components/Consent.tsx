import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Mail, FileText, Save } from "lucide-react";

interface ConsentProps {
  contactId: string;
  onSaved?: () => void;
}

export default function Consent({ contactId, onSaved }: ConsentProps) {
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadExistingConsents();
  }, [contactId]);

  async function loadExistingConsents() {
    if (!contactId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/privacy/consent/${contactId}`);
      if (response.ok) {
        const consents = await response.json();
        setTerms(consents.terms || false);
        setMarketing(consents.marketing || false);
        setPrivacy(consents.privacy || false);
      }
    } catch (error) {
      console.error('Error loading consents:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function save() {
    if (!contactId) {
      alert("Contact ID is required");
      return;
    }

    setIsSaving(true);
    try {
      const consents = [
        { kind: "terms", granted: terms },
        { kind: "marketing", granted: marketing },
        { kind: "privacy", granted: privacy }
      ];

      for (const consent of consents) {
        const response = await fetch(`/api/privacy/consent/${contactId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(consent)
        });

        if (!response.ok) {
          throw new Error(`Failed to save ${consent.kind} consent`);
        }
      }

      alert("Privacy preferences saved successfully");
      if (onSaved) onSaved();
    } catch (error) {
      console.error('Error saving consents:', error);
      alert("Error saving privacy preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-600">
            Loading privacy preferences...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-teal-600" />
          <CardTitle className="text-lg">Privacy Preferences</CardTitle>
        </div>
        <p className="text-sm text-gray-600">
          Manage your consent preferences for data processing and communications.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Checkbox
              id="terms"
              checked={terms}
              onCheckedChange={(checked) => setTerms(checked as boolean)}
            />
            <div className="flex-1">
              <label htmlFor="terms" className="text-sm font-medium cursor-pointer">
                <FileText className="w-4 h-4 inline mr-2" />
                Terms and Conditions
              </label>
              <p className="text-xs text-gray-600 mt-1">
                I agree to the Terms of Service and understand how my data will be processed 
                for loan application purposes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Checkbox
              id="privacy"
              checked={privacy}
              onCheckedChange={(checked) => setPrivacy(checked as boolean)}
            />
            <div className="flex-1">
              <label htmlFor="privacy" className="text-sm font-medium cursor-pointer">
                <Shield className="w-4 h-4 inline mr-2" />
                Privacy Policy
              </label>
              <p className="text-xs text-gray-600 mt-1">
                I acknowledge that I have read and understand the Privacy Policy 
                regarding data collection and usage.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <Checkbox
              id="marketing"
              checked={marketing}
              onCheckedChange={(checked) => setMarketing(checked as boolean)}
            />
            <div className="flex-1">
              <label htmlFor="marketing" className="text-sm font-medium cursor-pointer">
                <Mail className="w-4 h-4 inline mr-2" />
                Marketing Communications
              </label>
              <p className="text-xs text-gray-600 mt-1">
                I consent to receive marketing emails about new lending products 
                and financial services. You can unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button 
            onClick={save}
            disabled={isSaving || !contactId}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Privacy Preferences"}
          </Button>
        </div>

        {!contactId && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-amber-800 text-sm">
              Contact ID is required to save preferences.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}