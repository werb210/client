import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'loading';
  message: string;
  details?: any;
}

export function PWADiagnostics() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // 1. HTTPS Check
    try {
      const isHTTPS = window.location.protocol === 'https:';
      results.push({
        name: 'HTTPS Protocol',
        status: isHTTPS ? 'pass' : 'fail',
        message: isHTTPS ? 'Site served over HTTPS' : 'Site must be served over HTTPS for PWA features'
      });
    } catch (error) {
      results.push({
        name: 'HTTPS Protocol',
        status: 'fail',
        message: `HTTPS check failed: ${error}`
      });
    }

    // 2. Manifest Check
    try {
      const manifestResponse = await fetch('/manifest.json');
      if (manifestResponse.ok) {
        const manifest = await manifestResponse.json();
        const hasRequiredFields = manifest.name && manifest.short_name && manifest.start_url && manifest.display && manifest.icons;
        results.push({
          name: 'Web App Manifest',
          status: hasRequiredFields ? 'pass' : 'warning',
          message: hasRequiredFields ? 'Manifest is valid with required fields' : 'Manifest missing some required fields',
          details: manifest
        });
      } else {
        results.push({
          name: 'Web App Manifest',
          status: 'fail',
          message: `Manifest not accessible: ${manifestResponse.status} ${manifestResponse.statusText}`
        });
      }
    } catch (error) {
      results.push({
        name: 'Web App Manifest',
        status: 'fail',
        message: `Manifest fetch failed: ${error}`
      });
    }

    // 3. Service Worker Check
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          results.push({
            name: 'Service Worker',
            status: 'pass',
            message: 'Service Worker is registered and active',
            details: {
              scope: registration.scope,
              state: registration.active?.state,
              scriptURL: registration.active?.scriptURL
            }
          });
        } else {
          results.push({
            name: 'Service Worker',
            status: 'fail',
            message: 'Service Worker not registered'
          });
        }
      } else {
        results.push({
          name: 'Service Worker',
          status: 'fail',
          message: 'Service Worker not supported in this browser'
        });
      }
    } catch (error) {
      results.push({
        name: 'Service Worker',
        status: 'fail',
        message: `Service Worker check failed: ${error}`
      });
    }

    // 4. Service Worker File Check
    try {
      const swResponse = await fetch('/service-worker.js');
      results.push({
        name: 'Service Worker File',
        status: swResponse.ok ? 'pass' : 'fail',
        message: swResponse.ok ? 
          `Service Worker file accessible (${swResponse.headers.get('content-type')})` : 
          `Service Worker file not accessible: ${swResponse.status} ${swResponse.statusText}`
      });
    } catch (error) {
      results.push({
        name: 'Service Worker File',
        status: 'fail',
        message: `Service Worker file fetch failed: ${error}`
      });
    }

    // 5. Install Prompt Availability
    try {
      const isInstallable = (window as any).deferredPrompt !== undefined;
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone === true;
      
      if (isStandalone) {
        results.push({
          name: 'PWA Installation',
          status: 'pass',
          message: 'App is running in standalone mode (already installed)'
        });
      } else if (isInstallable) {
        results.push({
          name: 'PWA Installation',
          status: 'pass',
          message: 'Install prompt is available'
        });
      } else {
        results.push({
          name: 'PWA Installation',
          status: 'warning',
          message: 'Install prompt not available (may need multiple visits or user engagement)'
        });
      }
    } catch (error) {
      results.push({
        name: 'PWA Installation',
        status: 'warning',
        message: `Install prompt check failed: ${error}`
      });
    }

    // 6. Notification Permission
    try {
      const permission = 'Notification' in window ? Notification.permission : 'unsupported';
      results.push({
        name: 'Push Notifications',
        status: permission === 'granted' ? 'pass' : permission === 'denied' ? 'fail' : 'warning',
        message: `Notification permission: ${permission}`
      });
    } catch (error) {
      results.push({
        name: 'Push Notifications',
        status: 'fail',
        message: `Notification check failed: ${error}`
      });
    }

    // 7. Browser Compatibility
    try {
      const userAgent = navigator.userAgent;
      const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      
      let browserStatus = 'pass';
      let browserMessage = 'Browser supports PWA features';
      
      if (isIOS && !isSafari) {
        browserStatus = 'warning';
        browserMessage = 'iOS PWA features work best in Safari, not in-app browsers';
      }
      
      results.push({
        name: 'Browser Compatibility',
        status: browserStatus as any,
        message: browserMessage,
        details: { userAgent, isSafari, isIOS, isAndroid }
      });
    } catch (error) {
      results.push({
        name: 'Browser Compatibility',
        status: 'warning',
        message: `Browser check failed: ${error}`
      });
    }

    // 8. Cache API
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        results.push({
          name: 'Cache API',
          status: 'pass',
          message: `Cache API available with ${cacheNames.length} cache(s)`,
          details: cacheNames
        });
      } else {
        results.push({
          name: 'Cache API',
          status: 'fail',
          message: 'Cache API not supported'
        });
      }
    } catch (error) {
      results.push({
        name: 'Cache API',
        status: 'fail',
        message: `Cache API check failed: ${error}`
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'loading': return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const className = {
      pass: 'bg-green-500',
      fail: 'bg-red-500',
      warning: 'bg-yellow-500',
      loading: 'bg-blue-500'
    }[status];
    
    return <Badge className={className}>{status.toUpperCase()}</Badge>;
  };

  const passCount = diagnostics.filter(d => d.status === 'pass').length;
  const failCount = diagnostics.filter(d => d.status === 'fail').length;
  const warningCount = diagnostics.filter(d => d.status === 'warning').length;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>PWA Diagnostic & A2HS Compatibility Check</CardTitle>
          <CardDescription>
            Comprehensive audit for Progressive Web App features and "Add to Home Screen" functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{passCount} Passed</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">{warningCount} Warnings</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">{failCount} Failed</span>
              </div>
            </div>
            <Button onClick={runDiagnostics} disabled={isRunning} variant="outline" size="sm">
              {isRunning ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              Re-run Diagnostics
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {diagnostics.map((diagnostic, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getStatusIcon(diagnostic.status)}
                  <h3 className="font-medium">{diagnostic.name}</h3>
                </div>
                {getStatusBadge(diagnostic.status)}
              </div>
              <p className="text-sm text-gray-600 mb-2">{diagnostic.message}</p>
              {diagnostic.details && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    View Details
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                    {JSON.stringify(diagnostic.details, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>iPad Safari A2HS Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p><strong>For iPad Safari users:</strong></p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Open <code className="bg-gray-100 px-1 rounded">https://clientportal.boreal.financial</code> in Safari (not Chrome or in-app browsers)</li>
              <li>Interact with the page (tap buttons, scroll, etc.)</li>
              <li>Close the tab and visit the site again (A2HS requires multiple visits)</li>
              <li>Look for the install banner or tap the Share button → "Add to Home Screen"</li>
              <li>The app will appear on your home screen as a standalone app</li>
            </ol>
            <p className="mt-4 p-3 bg-blue-50 rounded">
              <strong>Note:</strong> A2HS only works in Safari on iOS, not in Chrome or other in-app browsers. 
              Some features may require 2+ visits to activate.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}