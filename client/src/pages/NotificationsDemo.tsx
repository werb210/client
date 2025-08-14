import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import NotifBellClient from "@/components/NotifBellClient";
import { Bell, MessageSquare, Settings, User } from "lucide-react";

export default function NotificationsDemo() {
  const [contactId, setContactId] = useState("demo-contact-789");
  const [showBell, setShowBell] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Client Notifications System Demo
          </h1>
          <p className="text-gray-600">
            Real-time notification system with bell icon and notification center
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Notification Bell Demo */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-teal-600" />
                <CardTitle>Notification Bell</CardTitle>
              </div>
              <p className="text-sm text-gray-600">
                Real-time notification bell with live updates via Server-Sent Events
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="contact-id">Contact ID</Label>
                  <Input
                    id="contact-id"
                    value={contactId}
                    onChange={(e) => setContactId(e.target.value)}
                    placeholder="Enter contact ID"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="show-bell"
                    checked={showBell}
                    onChange={(e) => setShowBell(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="show-bell" className="text-sm">Show notification bell</Label>
                </div>
              </div>

              {showBell && contactId && (
                <div className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Live Notification Bell:</span>
                    <NotifBellClient contactId={contactId} />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Click the bell to open the notifications center
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  The notification bell connects to a real-time stream and shows live updates.
                  Badge count increases when new notifications arrive.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Center Demo */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-teal-600" />
                <CardTitle>Notification Center</CardTitle>
              </div>
              <p className="text-sm text-gray-600">
                Full notification management interface
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => window.open(`/client/notifications?contactId=${contactId}`, '_blank')}
                className="w-full bg-teal-600 hover:bg-teal-700"
                disabled={!contactId}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Open Notification Center
              </Button>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Real-time notification updates</li>
                  <li>• Mark notifications as read</li>
                  <li>• Notification type indicators</li>
                  <li>• Responsive mobile design</li>
                  <li>• Error handling and loading states</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-gray-600" />
              System Integration & Testing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Real-time Features</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Server-Sent Events (SSE)</li>
                  <li>• Live notification counter</li>
                  <li>• Automatic reconnection</li>
                  <li>• Connection status indicator</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">Notification Types</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• KYC approval/rejection</li>
                  <li>• Document signing complete</li>
                  <li>• Application status updates</li>
                  <li>• SLA breach notifications</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">API Endpoints</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• GET /api/client/notifications</li>
                  <li>• POST /api/client/notifications/:id/read</li>
                  <li>• SSE /api/client/notifications/stream</li>
                  <li>• POST /api/client/notifications/test</li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-medium text-amber-800 mb-2">Testing Instructions</h4>
              <div className="space-y-1 text-amber-700 text-sm">
                <p>• Run Playwright tests: <code className="bg-amber-100 px-1 rounded">npx playwright test tests/notifications-client.spec.ts</code></p>
                <p>• Test real-time: Create test notification via API to see live updates</p>
                <p>• Integration: Complete KYC or signing flow to trigger automatic notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Example */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Workflow Example</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">1. Action Occurs</h4>
                <p className="text-sm text-gray-600">User signs document or KYC approved</p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Settings className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">2. System Creates</h4>
                <p className="text-sm text-gray-600">Notification stored in database</p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Bell className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">3. Real-time Update</h4>
                <p className="text-sm text-gray-600">SSE pushes to notification bell</p>
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <MessageSquare className="w-6 h-6 text-teal-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-1">4. User Views</h4>
                <p className="text-sm text-gray-600">Click bell to see full details</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}