import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Smartphone, Bell, Download, Wifi, WifiOff } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'pending' | 'warning';
  message: string;
  details?: string;
}

export default function PWAComprehensiveTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'pending' | 'running' | 'complete'>('pending');

  const updateTestResult = (name: string, status: TestResult['status'], message: string, details?: string) => {
    setTestResults(prev => {
      const updated = prev.filter(r => r.name !== name);
      return [...updated, { name, status, message, details }];
    });
  };

  const runComprehensiveTest = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    setTestResults([]);

    // Test 1: Service Worker Registration
    updateTestResult('Service Worker', 'pending', 'Testing service worker registration...');
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        if (registration) {
          updateTestResult('Service Worker', 'pass', 'Service worker registered successfully', `Scope: ${registration.scope}`);
        }
      } else {
        updateTestResult('Service Worker', 'fail', 'Service workers not supported in this browser');
      }
    } catch (error) {
      updateTestResult('Service Worker', 'fail', 'Service worker registration failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 2: Push Notification Support
    updateTestResult('Push Notifications', 'pending', 'Testing push notification support...');
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          updateTestResult('Push Notifications', 'pass', 'Push notifications supported and permitted');
        } else if (permission === 'denied') {
          updateTestResult('Push Notifications', 'warning', 'Push notifications denied by user');
        } else {
          updateTestResult('Push Notifications', 'warning', 'Push notification permission pending');
        }
      } else {
        updateTestResult('Push Notifications', 'fail', 'Push notifications not supported');
      }
    } catch (error) {
      updateTestResult('Push Notifications', 'fail', 'Push notification test failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 3: VAPID Endpoint Connectivity
    updateTestResult('VAPID Keys', 'pending', 'Testing VAPID key endpoint...');
    try {
      const response = await fetch('/api/vapid-public-key');
      if (response.ok) {
        const data = await response.json();
        if (data.publicKey) {
          updateTestResult('VAPID Keys', 'pass', 'VAPID public key retrieved successfully', `Key length: ${data.publicKey.length} chars`);
        } else {
          updateTestResult('VAPID Keys', 'fail', 'VAPID public key not found in response');
        }
      } else {
        updateTestResult('VAPID Keys', 'fail', `VAPID endpoint returned ${response.status}`);
      }
    } catch (error) {
      updateTestResult('VAPID Keys', 'fail', 'VAPID endpoint connectivity failed', error instanceof Error ? error.message : 'Network error');
    }

    // Test 4: PWA Manifest
    updateTestResult('PWA Manifest', 'pending', 'Testing PWA manifest...');
    try {
      const response = await fetch('/manifest.json');
      if (response.ok) {
        const manifest = await response.json();
        if (manifest.name && manifest.icons && manifest.start_url) {
          updateTestResult('PWA Manifest', 'pass', 'PWA manifest loaded successfully', `App: ${manifest.name}`);
        } else {
          updateTestResult('PWA Manifest', 'warning', 'PWA manifest missing required fields');
        }
      } else {
        updateTestResult('PWA Manifest', 'fail', `Manifest endpoint returned ${response.status}`);
      }
    } catch (error) {
      updateTestResult('PWA Manifest', 'fail', 'Manifest loading failed', error instanceof Error ? error.message : 'Network error');
    }

    // Test 5: IndexedDB Support (for offline features)
    updateTestResult('IndexedDB', 'pending', 'Testing IndexedDB support...');
    try {
      if ('indexedDB' in window) {
        // Test opening a database
        const request = indexedDB.open('PWATest', 1);
        request.onsuccess = () => {
          updateTestResult('IndexedDB', 'pass', 'IndexedDB supported and accessible');
          request.result.close();
        };
        request.onerror = () => {
          updateTestResult('IndexedDB', 'fail', 'IndexedDB access failed');
        };
      } else {
        updateTestResult('IndexedDB', 'fail', 'IndexedDB not supported');
      }
    } catch (error) {
      updateTestResult('IndexedDB', 'fail', 'IndexedDB test failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 6: Camera API (for document upload)
    updateTestResult('Camera API', 'pending', 'Testing camera API support...');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Don't actually request camera access, just check if it's available
        updateTestResult('Camera API', 'pass', 'Camera API supported (access not tested)');
      } else {
        updateTestResult('Camera API', 'warning', 'Camera API not supported on this device');
      }
    } catch (error) {
      updateTestResult('Camera API', 'fail', 'Camera API test failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 7: Online/Offline Detection
    updateTestResult('Network Detection', 'pending', 'Testing online/offline detection...');
    try {
      if ('onLine' in navigator) {
        const isOnline = navigator.onLine;
        updateTestResult('Network Detection', 'pass', `Network detection working (currently ${isOnline ? 'online' : 'offline'})`);
      } else {
        updateTestResult('Network Detection', 'warning', 'Network detection not supported');
      }
    } catch (error) {
      updateTestResult('Network Detection', 'fail', 'Network detection test failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 8: Socket.IO Connectivity (for real-time features)
    updateTestResult('Socket.IO', 'pending', 'Testing Socket.IO connectivity...');
    try {
      // Check if Socket.IO is available (already connected in main app)
      if (typeof window !== 'undefined' && (window as any).io) {
        updateTestResult('Socket.IO', 'pass', 'Socket.IO client available');
      } else {
        updateTestResult('Socket.IO', 'warning', 'Socket.IO client not detected');
      }
    } catch (error) {
      updateTestResult('Socket.IO', 'fail', 'Socket.IO test failed', error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 9: PWA Installation Prompt
    updateTestResult('Install Prompt', 'pending', 'Testing PWA installation capability...');
    try {
      // Check if the app is already installed or installable
      if ((window as any).matchMedia('(display-mode: standalone)').matches) {
        updateTestResult('Install Prompt', 'pass', 'PWA is already installed and running in standalone mode');
      } else if ('BeforeInstallPromptEvent' in window) {
        updateTestResult('Install Prompt', 'pass', 'PWA installation supported (prompt available on user gesture)');
      } else {
        updateTestResult('Install Prompt', 'warning', 'PWA installation may not be supported on this browser/device');
      }
    } catch (error) {
      updateTestResult('Install Prompt', 'warning', 'Install prompt test failed', error instanceof Error ? error.message : 'Unknown error');
    }

    setTimeout(() => {
      setIsRunning(false);
      setOverallStatus('complete');
    }, 2000);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'pending': return <div className="h-4 w-4 rounded-full border-2 border-gray-300 animate-spin border-t-blue-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      pass: 'bg-green-100 text-green-800',
      fail: 'bg-red-100 text-red-800', 
      warning: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const passCount = testResults.filter(r => r.status === 'pass').length;
  const failCount = testResults.filter(r => r.status === 'fail').length;
  const warningCount = testResults.filter(r => r.status === 'warning').length;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PWA Comprehensive Test Suite</h1>
        <p className="text-gray-600">Complete validation of Progressive Web App features</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-green-600">{passCount}</p>
              <p className="text-sm text-gray-600">Tests Passed</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <AlertCircle className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
              <p className="text-sm text-gray-600">Warnings</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <XCircle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-2xl font-bold text-red-600">{failCount}</p>
              <p className="text-sm text-gray-600">Tests Failed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            PWA Feature Tests
          </CardTitle>
          <CardDescription>
            Comprehensive testing of all Progressive Web App capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={runComprehensiveTest} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <div className="h-4 w-4 rounded-full border-2 border-white/20 animate-spin border-t-white" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              {isRunning ? 'Running Tests...' : 'Run All Tests'}
            </Button>
            
            {overallStatus === 'complete' && (
              <Badge className={`${
                failCount === 0 ? 'bg-green-100 text-green-800' : 
                failCount > 3 ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {failCount === 0 ? 'ALL TESTS PASSED' : 
                 failCount > 3 ? 'CRITICAL ISSUES' : 
                 'MINOR ISSUES'}
              </Badge>
            )}
          </div>

          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{result.name}</h3>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{result.message}</p>
                  {result.details && (
                    <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">{result.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PWA Features Summary</CardTitle>
          <CardDescription>Overview of tested Progressive Web App capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Push Notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-blue-500" />
              <span className="text-sm">App Installation</span>
            </div>
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Offline Support</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Mobile Optimized</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}