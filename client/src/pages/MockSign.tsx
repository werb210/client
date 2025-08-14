import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, AlertCircle, User, Package } from "lucide-react";

export default function MockSign() {
  const [packId, setPackId] = useState("");
  const [contactId, setContactId] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const u = new URLSearchParams(location.search);
    setPackId(u.get("pack") || "");
    setContactId(u.get("contact") || "");
  }, []);

  async function sign() {
    if (!packId || !contactId) {
      alert("Missing required parameters (pack ID or contact ID)");
      return;
    }

    setIsSigning(true);
    setHasError(false);

    try {
      const response = await fetch("/api/docs/packs/esign/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId, status: "completed" })
      });

      if (response.ok) {
        alert("Documents signed successfully (mock)");
        // Redirect back to client portal
        window.location.href = "/dashboard";
      } else {
        throw new Error(`Signing failed: ${response.status}`);
      }
    } catch (error) {
      console.error("Mock signing error:", error);
      setHasError(true);
      alert("Error signing documents. Please try again.");
    } finally {
      setIsSigning(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-teal-600" />
            </div>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Sign Documents
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Review and electronically sign your financing documents
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Document Pack Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-blue-900 mb-2">Document Package Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">Package ID:</span>
                      <p className="text-blue-800">{packId || "Not provided"}</p>
                    </div>
                    <div>
                      <span className="text-blue-700 font-medium">Contact ID:</span>
                      <p className="text-blue-800">{contactId || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mock Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-900 mb-1">Mock Signing Interface</h3>
                  <p className="text-amber-800 text-sm">
                    This is a simulated e-signature interface for testing purposes. 
                    In production, this would integrate with DocuSign, SignNow, or similar e-signature providers.
                  </p>
                </div>
              </div>
            </div>

            {/* Validation Errors */}
            {(!packId || !contactId) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-900 mb-1">Missing Required Parameters</h3>
                    <p className="text-red-800 text-sm">
                      This signing interface requires both pack and contact parameters in the URL:
                      <br />
                      <code className="bg-red-100 px-1 rounded text-xs mt-1 block">
                        /client/sign/mock?pack=PACK_ID&contact=CONTACT_ID
                      </code>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Document Preview Section */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Documents to Sign
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Loan Agreement and Terms
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Personal Guarantee (if applicable)
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Security Agreement
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Disclosure Statements
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={sign}
                disabled={isSigning || !packId || !contactId}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                size="lg"
              >
                {isSigning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept & Sign (Mock)
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => window.history.back()}
                disabled={isSigning}
                size="lg"
              >
                Cancel
              </Button>
            </div>

            {/* Error State */}
            {hasError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">
                  An error occurred while processing your signature. Please try again or contact support.
                </p>
              </div>
            )}

            {/* Success Instructions */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-900 mb-1">Next Steps</h3>
                  <p className="text-green-800 text-sm">
                    After signing, you'll be redirected to your dashboard where you can:
                  </p>
                  <ul className="text-green-800 text-sm mt-2 space-y-1">
                    <li>• View your signed documents</li>
                    <li>• Track your application status</li>
                    <li>• Access additional resources</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}