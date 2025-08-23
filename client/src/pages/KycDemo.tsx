import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, ExternalLink, Database, Settings, Check } from "lucide-react";

export default function KycDemo() {
  const [contactId, setContactId] = useState("KYC_DEMO_USER");
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const startKycDemo = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/client/privacy/kyc/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId })
      });
      
      const result = await response.json();
      setTestResult(result);
      console.log("KYC Start Result:", result);
    } catch (error) {
      console.error("KYC Demo error:", error);
      setTestResult({ error: "Demo failed" });
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async (ref: string) => {
    try {
      const response = await fetch(`/api/client/privacy/kyc/status/${ref}`);
      const result = await response.json();
      setTestResult({ ...testResult, statusCheck: result });
      console.log("Status Check Result:", result);
    } catch (error) {
      console.error("Status check error:", error);
    }
  };

  const testWebhook = async () => {
    try {
      const mockWebhookData = {
        data: {
          id: testResult?.session?.providerRef || "mock_123",
          attributes: {
            status: "completed",
            "inquiry-id": testResult?.session?.providerRef || "mock_123"
          }
        }
      };

      console.log("Mock webhook test:", mockWebhookData);
      alert("Webhook test logged to console. In production, this would be sent by Persona.");
    } catch (error) {
      console.error("Webhook test error:", error);
    }
  };

  const openKycInterface = () => {
    const url = `/client/kyc/start?contactId=${encodeURIComponent(contactId)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            KYC Verification System Demo
          </h1>
          <p className="text-gray-600">
            Persona integration for identity verification with compliance features
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* KYC Demo */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-teal-600" />
                <CardTitle>KYC Demo</CardTitle>
              </div>
              <p className="text-sm text-gray-600">
                Test the KYC verification flow with mock Persona integration
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contact-id">Contact ID</Label>
                <Input
                  id="contact-id"
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  placeholder="Enter contact ID"
                />
              </div>

              <div className="space-y-2">
                <Button
                  onClick={startKycDemo}
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  Start KYC Demo
                </Button>

                <Button
                  onClick={openKycInterface}
                  variant="outline"
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open KYC Interface
                </Button>
              </div>

              {testResult && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium mb-2">Demo Result:</h4>
                  <div className="space-y-2 text-sm">
                    {testResult.success !== undefined && (
                      <div className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-green-600" />
                        <span>Success: {testResult.success ? "Yes" : "No"}</span>
                      </div>
                    )}
                    
                    {testResult.session?.status && (
                      <div>
                        <strong>Status:</strong> 
                        <Badge variant="outline" className="ml-1">
                          {testResult.session.status}
                        </Badge>
                      </div>
                    )}
                    
                    {testResult.session?.providerRef && (
                      <div>
                        <strong>Provider Ref:</strong> 
                        <span className="font-mono text-xs ml-1">
                          {testResult.session.providerRef}
                        </span>
                      </div>
                    )}
                    
                    {testResult.session?.url && (
                      <div>
                        <strong>URL:</strong> 
                        <a 
                          href={testResult.session.url} 
                           
                          className="text-blue-600 hover:underline text-xs ml-1"
                        >
                          {testResult.session.url}
                        </a>
                      </div>
                    )}

                    {testResult.error && (
                      <div className="text-red-600">
                        <strong>Error:</strong> {testResult.error}
                      </div>
                    )}
                  </div>

                  {testResult.session?.providerRef && (
                    <div className="mt-3 space-y-2">
                      <Button
                        onClick={() => checkStatus(testResult.session.providerRef)}
                        size="sm"
                        variant="outline"
                        className="w-full"
                      >
                        Check Status
                      </Button>
                      
                      <Button
                        onClick={testWebhook}
                        size="sm"
                        variant="outline"
                        className="w-full"
                      >
                        Test Webhook
                      </Button>
                    </div>
                  )}

                  {testResult.statusCheck && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                      <strong>Status Check:</strong> {JSON.stringify(testResult.statusCheck, null, 2)}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Settings className="w-6 h-6 text-gray-600" />
                KYC System Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Persona Integration
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1 mt-2">
                    <li>• Real-time identity verification</li>
                    <li>• Secure document upload and analysis</li>
                    <li>• Webhook status updates</li>
                    <li>• Configurable verification templates</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Database Tracking
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1 mt-2">
                    <li>• Session management and history</li>
                    <li>• Status tracking and updates</li>
                    <li>• Provider metadata storage</li>
                    <li>• Compliance event logging</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Compliance Features
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1 mt-2">
                    <li>• STOP/HELP keyword handling</li>
                    <li>• Quiet hours enforcement</li>
                    <li>• Automated compliance checking</li>
                    <li>• Audit trail maintenance</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Information */}
        <Card>
          <CardHeader>
            <CardTitle>KYC API Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Core Endpoints:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• POST /api/client/privacy/kyc/start</li>
                  <li>• GET /api/client/privacy/kyc/status/:ref</li>
                  <li>• GET /api/client/privacy/kyc/sessions/:contactId</li>
                  <li>• POST /api/client/privacy/kyc/webhook</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Environment Variables:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• KYC_PROVIDER (persona)</li>
                  <li>• PERSONA_API_KEY</li>
                  <li>• PERSONA_TEMPLATE_ID</li>
                  <li>• KYC_WEBHOOK_SECRET</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Development Mode</h4>
              <p className="text-blue-700 text-sm">
                When API keys are not configured, the system automatically falls back to mock/demo mode 
                for testing and development purposes. Mock sessions redirect to /client/kyc/mock for UI testing.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}