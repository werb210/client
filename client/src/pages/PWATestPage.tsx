/**
 * PWA Test Page - Testing Progressive Web App Features
 * Including push notifications, offline support, and camera document upload
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import PWANotificationManager from '@/components/PWANotificationManager';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { PWAOfflineQueue } from '@/components/PWAOfflineQueue';
import { CameraDocumentUpload } from '@/components/CameraDocumentUpload';
import { Smartphone, Wifi, Bell, Camera, Download } from 'lucide-react';

export default function PWATestPage() {
  const testOfflineMode = () => {
    // Simulate offline by attempting to fetch a non-existent endpoint
    fetch('/api/offline-test')
      .then(() => console.log('Online'))
      .catch(() => console.log('Offline mode detected'));
  };

  const testServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        console.log('Service Worker ready:', registration);
        alert('Service Worker is active and ready!');
      } catch (error) {
        console.error('Service Worker not available:', error);
        alert('Service Worker not available');
      }
    } else {
      alert('Service Worker not supported in this browser');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PWA Testing Suite
          </h1>
          <p className="text-lg text-gray-600">
            Test all Progressive Web App features for Boreal Financial
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PWA Install */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-blue-600" />
                App Installation
              </CardTitle>
              <CardDescription>
                Install the app on your device for native app experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PWAInstallPrompt />
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-green-600" />
                Push Notifications
              </CardTitle>
              <CardDescription>
                Enable notifications for application updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PWANotificationManager />
            </CardContent>
          </Card>

          {/* Service Worker Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-purple-600" />
                Service Worker
              </CardTitle>
              <CardDescription>
                Background processing and offline support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={testServiceWorker} variant="outline" className="w-full">
                Test Service Worker
              </Button>
              <Button onClick={testOfflineMode} variant="outline" className="w-full">
                Test Offline Mode
              </Button>
            </CardContent>
          </Card>

          {/* Camera Document Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-orange-600" />
                Camera Upload
              </CardTitle>
              <CardDescription>
                Test mobile camera document capture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CameraDocumentUpload
                onUpload={(file: File) => {
                  console.log('Test upload:', file.name);
                  alert(`Camera captured: ${file.name}`);
                }}
                documentType="Tax Returns"
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Offline Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-teal-600" />
              Offline Queue Status
            </CardTitle>
            <CardDescription>
              Monitor pending uploads and synchronization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PWAOfflineQueue />
          </CardContent>
        </Card>

        {/* PWA Feature Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>PWA Feature Checklist</CardTitle>
            <CardDescription>
              Verify all Progressive Web App features are working
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Core PWA Features</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Web App Manifest
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Service Worker
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    HTTPS (Required for PWA)
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Responsive Design
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Advanced Features</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Push Notifications
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Offline Support
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Background Sync
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Camera Integration
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testing Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Testing Instructions</CardTitle>
            <CardDescription className="text-blue-700">
              Follow these steps to test PWA functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ol className="list-decimal list-inside space-y-2">
              <li>Test app installation prompt (should appear on mobile)</li>
              <li>Enable push notifications and send a test notification</li>
              <li>Try camera document upload on mobile device</li>
              <li>Go offline and test cached content loading</li>
              <li>Submit a form while offline to test background sync</li>
              <li>Return online and verify queued actions execute</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}