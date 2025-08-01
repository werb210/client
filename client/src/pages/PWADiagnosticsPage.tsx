import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePWAManager } from '@/hooks/usePWAManager';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Bell, 
  Download, 
  Upload, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Camera,
  Database,
  Zap,
  Globe,
  Settings,
  AlertTriangle
} from 'lucide-react';

export default function PWADiagnosticsPage() {
  const { status, installApp, registerBackgroundSync, setupPushNotifications } = usePWAManager();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const refreshDiagnostics = async () => {
    setIsRefreshing(true);
    addTestResult('Refreshing PWA diagnostics...');
    
    // Re-initialize push notifications
    await setupPushNotifications();
    
    // Test background sync
    await registerBackgroundSync('diagnostic-test');
    
    addTestResult('Diagnostics refresh completed');
    setIsRefreshing(false);
  };

  const testCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      addTestResult('✅ Camera access granted');
    } catch (error) {
      addTestResult(`❌ Camera access denied: ${error}`);
    }
  };

  const testOfflineStorage = () => {
    try {
      // Test localStorage
      localStorage.setItem('pwa-diagnostic-test', 'test-value');
      const retrieved = localStorage.getItem('pwa-diagnostic-test');
      localStorage.removeItem('pwa-diagnostic-test');
      
      if (retrieved === 'test-value') {
        addTestResult('✅ Local storage working');
      } else {
        addTestResult('❌ Local storage test failed');
      }
      
      // Test IndexedDB
      if ('indexedDB' in window) {
        addTestResult('✅ IndexedDB supported');
      } else {
        addTestResult('❌ IndexedDB not supported');
      }
    } catch (error) {
      addTestResult(`❌ Storage test failed: ${error}`);
    }
  };

  const testPushNotification = async () => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'PWA Diagnostic Test',
          body: 'This is a test notification from the PWA diagnostics page',
          url: '/pwa-diagnostics'
        })
      });
      
      if (response.ok) {
        addTestResult('✅ Test push notification sent');
      } else {
        addTestResult('❌ Push notification test failed');
      }
    } catch (error) {
      addTestResult(`❌ Push test error: ${error}`);
    }
  };

  const getStatusBadge = (condition: boolean, label: string) => {
    if (condition) {
      return <Badge variant="default" className="bg-green-600">{label}</Badge>;
    }
    return <Badge variant="secondary">{label}</Badge>;
  };

  const getStatusIcon = (condition: boolean | undefined) => {
    if (condition === true) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (condition === false) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }
    return <Clock className="w-5 h-5 text-yellow-600" />;
  };

  useEffect(() => {
    addTestResult('PWA diagnostics page loaded');
    addTestResult(`User agent: ${navigator.userAgent}`);
    addTestResult(`Online status: ${navigator.onLine ? 'online' : 'offline'}`);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            PWA Diagnostic Suite
          </h1>
          <p className="text-gray-600">
            Complete Progressive Web App feature testing and status monitoring
          </p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                {status.isOnline ? <Wifi className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-red-600" />}
                Network Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {getStatusBadge(status.isOnline, status.isOnline ? 'Online' : 'Offline')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Database className="w-4 h-4" />
                Offline Storage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {getStatusBadge(status.offlineStorageActive, status.offlineStorageActive ? 'Active' : 'Inactive')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Bell className="w-4 h-4" />
                Push Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {status.pushSupported ? (
                  getStatusBadge(status.pushSubscribed, status.pushSubscribed ? 'Subscribed' : 'Available')
                ) : (
                  <Badge variant="destructive">Unsupported</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Smartphone className="w-4 h-4" />
                App Installation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {status.isInstalled ? (
                  getStatusBadge(true, 'Installed')
                ) : status.canInstall ? (
                  getStatusBadge(true, 'Available')
                ) : (
                  <Badge variant="secondary">Pending</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                PWA Feature Status
              </CardTitle>
              <CardDescription>
                Detailed status of all Progressive Web App features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.serviceWorkerReady)}
                  <span>Service Worker</span>
                </div>
                <Badge variant={status.serviceWorkerReady ? "default" : "secondary"}>
                  {status.serviceWorkerReady ? 'Active' : 'Pending'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.backgroundSyncSupported)}
                  <span>Background Sync</span>
                </div>
                <Badge variant={status.backgroundSyncSupported ? "default" : "secondary"}>
                  {status.backgroundSyncSupported ? 'Supported' : 'Pending'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.pushSupported)}
                  <span>Push Support</span>
                </div>
                <Badge variant={status.pushSupported ? "default" : "destructive"}>
                  {status.pushSupported ? 'Supported' : 'Unsupported'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.pushSubscribed)}
                  <span>Push Subscription</span>
                </div>
                <Badge variant={status.pushSubscribed ? "default" : "secondary"}>
                  {status.pushSubscribed ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.offlineStorageActive)}
                  <span>Offline Storage</span>
                </div>
                <Badge variant={status.offlineStorageActive ? "default" : "secondary"}>
                  {status.offlineStorageActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.isInstalled)}
                  <span>App Installation</span>
                </div>
                <Badge variant={status.isInstalled ? "default" : "secondary"}>
                  {status.isInstalled ? 'Installed' : status.canInstall ? 'Available' : 'Pending'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Test and initialize PWA features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={refreshDiagnostics} 
                disabled={isRefreshing}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Diagnostics
              </Button>

              {status.canInstall && !status.isInstalled && (
                <Button onClick={installApp} className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Install App
                </Button>
              )}

              <Button onClick={testPushNotification} className="w-full" variant="outline">
                <Bell className="w-4 h-4 mr-2" />
                Test Push Notification
              </Button>

              <Button onClick={testCameraAccess} className="w-full" variant="outline">
                <Camera className="w-4 h-4 mr-2" />
                Test Camera Access
              </Button>

              <Button onClick={testOfflineStorage} className="w-full" variant="outline">
                <Database className="w-4 h-4 mr-2" />
                Test Offline Storage
              </Button>

              <Separator />

              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Browser Support Notes:</p>
                <ul className="space-y-1">
                  <li>• Push notifications work in Chrome/Edge/Android</li>
                  <li>• iOS Safari requires manual "Add to Home Screen"</li>
                  <li>• Background sync needs Chrome/Edge desktop</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Test Results Log
            </CardTitle>
            <CardDescription>
              Real-time log of diagnostic tests and PWA events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48 w-full rounded border p-4">
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono text-muted-foreground">
                    {result}
                  </div>
                ))}
                {testResults.length === 0 && (
                  <div className="text-sm text-muted-foreground italic">
                    No test results yet. Click the test buttons above to see logs.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Instructions for resolving issues */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Troubleshooting Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Push Notifications "Unsupported":</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Test in Chrome Desktop or Android Chrome (not Safari)</li>
                <li>• Ensure you're on HTTPS (localhost or production domain)</li>
                <li>• Allow notifications when prompted</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">App Installation "Pending":</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Install prompt appears after PWA criteria are met</li>
                <li>• On iOS: Manual installation via Share → "Add to Home Screen"</li>
                <li>• Chrome: Look for install icon in address bar</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Service Worker "Pending":</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Hard refresh the page (Ctrl/Cmd + Shift + R)</li>
                <li>• Check browser console for service worker errors</li>
                <li>• Ensure /service-worker.js is accessible</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}