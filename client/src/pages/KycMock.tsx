import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function KycMock() {
  const [contactId, setContactId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setContactId(new URLSearchParams(location.search).get("contact") || "");
  }, []);

  async function complete(status: "approved" | "rejected") {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/privacy/kyc/webhook?ref=mock-${contactId}&status=${status}`, { 
        method: "POST" 
      });
      
      if (response.ok) {
        alert(`KYC ${status} successfully`);
      } else {
        alert(`KYC ${status} failed - please try again`);
      }
    } catch (error) {
      console.error('KYC completion error:', error);
      alert(`Error processing KYC ${status}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 p-6">
      <div className="max-w-md mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-teal-600" />
            </div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              KYC Verification (Mock)
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Simulated Know Your Customer verification for Contact ID: {contactId || "Not provided"}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {!contactId && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-amber-800 text-sm">
                  No contact ID provided. Add ?contact=YOUR_ID to the URL.
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-sm">
                This is a mock KYC verification system for testing purposes. 
                In production, this would integrate with actual identity verification services.
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => complete("approved")}
                disabled={isSubmitting || !contactId}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => complete("rejected")}
                disabled={isSubmitting || !contactId}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>

            {isSubmitting && (
              <div className="text-center text-sm text-gray-600">
                Processing KYC verification...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}