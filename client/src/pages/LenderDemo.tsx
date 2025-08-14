import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building2, ExternalLink, Key, Database, Users, MessageCircle, Upload } from "lucide-react";

export default function LenderDemo() {
  const [demoToken, setDemoToken] = useState("DEMO_LENDER_TOKEN_123");
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const openLenderPortal = () => {
    const url = `/lender/access?token=${encodeURIComponent(demoToken)}`;
    window.open(url, '_blank');
  };

  const testLenderAPI = async () => {
    setLoading(true);
    try {
      // Test the lender API endpoints
      const response = await fetch(`/api/lender/demo/setup?token=${encodeURIComponent(demoToken)}`, {
        method: 'POST'
      });
      
      const result = await response.json();
      setTestResult(result);
      console.log("Lender API Test Result:", result);
    } catch (error) {
      console.error("Lender API test error:", error);
      setTestResult({ error: "API test failed" });
    } finally {
      setLoading(false);
    }
  };

  const createDemoShare = async () => {
    try {
      // In a real system, this would create a share token via staff backend
      // For demo purposes, we'll use a mock token
      const mockShare = {
        token: `DEMO_${Date.now()}`,
        applicationId: "app_demo_123",
        partnerId: "partner_demo_456",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };

      setDemoToken(mockShare.token);
      console.log("Demo share created:", mockShare);
      
      alert(`Demo share created!\nToken: ${mockShare.token}\n\nNote: In production, this would be created by the staff backend and sent securely to lenders.`);
    } catch (error) {
      console.error("Create demo share error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Lender Portal System Demo
          </h1>
          <p className="text-gray-600">
            Secure token-based access for lenders to view applications, documents, and communicate
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Lender Portal Demo */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-blue-600" />
                <CardTitle>Lender Portal Access</CardTitle>
              </div>
              <p className="text-sm text-gray-600">
                Test the secure lender workspace with token-based authentication
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="demo-token">Access Token</Label>
                <Input
                  id="demo-token"
                  value={demoToken}
                  onChange={(e) => setDemoToken(e.target.value)}
                  placeholder="Enter lender access token"
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Button
                  onClick={openLenderPortal}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Lender Portal
                </Button>

                <Button
                  onClick={createDemoShare}
                  variant="outline"
                  className="w-full"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Create Demo Share Token
                </Button>

                <Button
                  onClick={testLenderAPI}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Database className="w-4 h-4 mr-2" />
                  )}
                  Test API & Setup Demo Data
                </Button>
              </div>

              {testResult && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium mb-2">API Test Result:</h4>
                  <div className="text-sm">
                    {testResult.ok ? (
                      <div className="text-green-700">
                        ✓ {testResult.message || "Success"}
                      </div>
                    ) : (
                      <div className="text-red-700">
                        ✗ {testResult.error || "Failed"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-6 h-6 text-gray-600" />
                Lender Portal Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Token-Based Security
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1 mt-2">
                    <li>• JWT token authentication</li>
                    <li>• Configurable permissions (view, upload, message)</li>
                    <li>• Expiration time controls</li>
                    <li>• Application-specific access</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Document Management
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1 mt-2">
                    <li>• Secure document upload to S3</li>
                    <li>• Document categorization and metadata</li>
                    <li>• Upload history and tracking</li>
                    <li>• File type validation and security</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Communication Portal
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1 mt-2">
                    <li>• Real-time messaging between lender and applicant</li>
                    <li>• Message history and audit trail</li>
                    <li>• Role-based message identification</li>
                    <li>• Portal-specific communication channel</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technical Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Lender Portal Technical Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">API Endpoints:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• GET /api/lender/app?token=...</li>
                  <li>• GET /api/lender/messages?token=...</li>
                  <li>• POST /api/lender/messages?token=...</li>
                  <li>• POST /api/lender/upload?token=...</li>
                  <li>• POST /api/lender/demo/setup?token=...</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Database Tables:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• lender_partners (partner info)</li>
                  <li>• app_lender_shares (access tokens)</li>
                  <li>• comm_messages (portal messages)</li>
                  <li>• documents (file management)</li>
                  <li>• applications (app data)</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Access Control</h4>
              <p className="text-blue-700 text-sm">
                Each lender receives a secure JWT token with specific permissions (view_docs, upload_docs, 
                read_messages, write_messages) and application scope. Tokens have configurable expiration 
                times and are validated on every request for maximum security.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* URL Examples */}
        <Card>
          <CardHeader>
            <CardTitle>Example Access URLs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded p-3">
                <Label className="text-xs text-gray-600">Demo Portal Access:</Label>
                <p className="font-mono text-sm break-all">
                  {window.location.origin}/lender/access?token={demoToken}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded p-3">
                <Label className="text-xs text-gray-600">Production Portal Access:</Label>
                <p className="font-mono text-sm break-all">
                  {window.location.origin}/lender/access?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                </p>
              </div>
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              <p>💡 In production, tokens are generated by the staff backend and securely shared with authorized lenders via email or secure messaging.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}