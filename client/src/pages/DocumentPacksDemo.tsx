import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Package, PenTool, User } from "lucide-react";

export default function DocumentPacksDemo() {
  const [packId, setPackId] = useState("DEMO_PACK_123");
  const [contactId, setContactId] = useState("demo-contact-456");

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Document Packs & E-Signature Demo
          </h1>
          <p className="text-gray-600">
            Demonstration of document packaging and electronic signature workflows
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Mock Signing Demo */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <PenTool className="w-6 h-6 text-teal-600" />
                <CardTitle>Mock E-Signature</CardTitle>
              </div>
              <p className="text-sm text-gray-600">
                Simulated electronic document signing process
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="pack-id">Document Pack ID</Label>
                  <Input
                    id="pack-id"
                    value={packId}
                    onChange={(e) => setPackId(e.target.value)}
                    placeholder="Enter pack ID"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact-id">Contact ID</Label>
                  <Input
                    id="contact-id"
                    value={contactId}
                    onChange={(e) => setContactId(e.target.value)}
                    placeholder="Enter contact ID"
                  />
                </div>
              </div>

              <Button
                onClick={() => window.open(`/client/sign/mock?pack=${packId}&contact=${contactId}`, '_blank')}
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={!packId || !contactId}
              >
                <PenTool className="w-4 h-4 mr-2" />
                Open Signing Interface
              </Button>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  Opens the mock e-signature interface where users can simulate 
                  signing documents electronically.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Document Packs Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-teal-600" />
                <CardTitle>Document Packs</CardTitle>
              </div>
              <p className="text-sm text-gray-600">
                Document package management and tracking
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => window.open(`/applications/TEST/docs`, '_blank')}
                variant="outline"
                className="w-full"
              >
                <Package className="w-4 h-4 mr-2" />
                View Document Packs
              </Button>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Sample Document Types</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Loan Agreement and Terms</li>
                  <li>• Personal Guarantee Forms</li>
                  <li>• Security Agreement Documents</li>
                  <li>• Disclosure Statements</li>
                  <li>• Authorization Forms</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-gray-600" />
              Testing & Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">E-Signature Testing</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Mock signing workflows</li>
                  <li>• Parameter validation</li>
                  <li>• Error handling</li>
                  <li>• Webhook simulation</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Document Management</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Pack creation and tracking</li>
                  <li>• Template management</li>
                  <li>• Status monitoring</li>
                  <li>• Reminder systems</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">API Integration</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Webhook endpoints</li>
                  <li>• Status callbacks</li>
                  <li>• Document rendering</li>
                  <li>• Signer management</li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-800 mb-2">Testing Instructions</h4>
              <div className="space-y-1 text-amber-700 text-sm">
                <p>• Run Playwright tests: <code className="bg-amber-100 px-1 rounded">npx playwright test tests/docpacks-esign.spec.ts</code></p>
                <p>• HTTP testing: <code className="bg-amber-100 px-1 rounded">./scripts/test-docpacks-esign.sh</code></p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Example */}
        <Card>
          <CardHeader>
            <CardTitle>E-Signature Workflow Example</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">1. Create Pack</h4>
                <p className="text-sm text-gray-600">Generate document package from templates</p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <User className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">2. Send to Signer</h4>
                <p className="text-sm text-gray-600">Deliver signing link to applicant</p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <PenTool className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">3. Sign Documents</h4>
                <p className="text-sm text-gray-600">Electronic signature completion</p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Package className="w-6 h-6 text-teal-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">4. Complete</h4>
                <p className="text-sm text-gray-600">Update status and process</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}