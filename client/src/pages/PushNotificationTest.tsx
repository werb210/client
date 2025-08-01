import React, { useState, useEffect } from 'react';
import { initializePushNotifications, getVapidPublicKey, subscribeToPush, sendSubscriptionToServer } from '../utils/push';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export function PushNotificationTest() {
  const [status, setStatus] = useState({
    permission: 'default',
    subscribed: false,
    vapidKey: null as string | null,
    serviceWorkerReady: false
  });
  
  const [testResults, setTestResults] = useState<string[]>([]);
  
  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Check initial status
  useEffect(() => {
    const checkStatus = async () => {
      // Check notification permission
      const permission = 'Notification' in window ? Notification.permission : 'unsupported';
      
      // Check service worker
      const serviceWorkerReady = 'serviceWorker' in navigator && 
        (await navigator.serviceWorker.getRegistration()) !== undefined;
      
      // Get VAPID key
      const vapidKey = await getVapidPublicKey();
      
      // Check if already subscribed
      let subscribed = false;
      if (serviceWorkerReady) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          subscribed = subscription !== null;
        } catch (error) {
          console.error('Error checking subscription:', error);
        }
      }
      
      setStatus({
        permission,
        subscribed,
        vapidKey,
        serviceWorkerReady
      });
      
      addResult(`Initial status: Permission=${permission}, Subscribed=${subscribed}, SW Ready=${serviceWorkerReady}`);
    };
    
    checkStatus();
  }, []);

  const handleRequestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setStatus(prev => ({ ...prev, permission }));
      addResult(`Permission result: ${permission}`);
    } catch (error) {
      addResult(`Permission error: ${error}`);
    }
  };

  const handleSubscribe = async () => {
    try {
      if (!status.vapidKey) {
        addResult('Error: No VAPID key available');
        return;
      }
      
      const subscription = await subscribeToPush(status.vapidKey);
      if (subscription) {
        const success = await sendSubscriptionToServer(subscription);
        setStatus(prev => ({ ...prev, subscribed: true }));
        addResult(`Subscription ${success ? 'successful' : 'failed to save to server'}`);
      } else {
        addResult('Subscription failed');
      }
    } catch (error) {
      addResult(`Subscription error: ${error}`);
    }
  };

  const handleInitializeAll = async () => {
    try {
      const success = await initializePushNotifications();
      setStatus(prev => ({ ...prev, subscribed: success }));
      addResult(`Full initialization: ${success ? 'successful' : 'failed'}`);
    } catch (error) {
      addResult(`Initialization error: ${error}`);
    }
  };

  const handleTestNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a local test notification',
        icon: '/icons/icon-192x192.png'
      });
      addResult('Local test notification sent');
    } else {
      addResult('Cannot send test notification - permission not granted');
    }
  };

  const getPermissionBadge = () => {
    switch (status.permission) {
      case 'granted': return <Badge className="bg-green-500">Granted</Badge>;
      case 'denied': return <Badge className="bg-red-500">Denied</Badge>;
      case 'default': return <Badge className="bg-yellow-500">Default</Badge>;
      default: return <Badge className="bg-gray-500">Unsupported</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Push Notification Test Suite</CardTitle>
          <CardDescription>
            Test and validate push notification functionality for the PWA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 mb-6">
            <div className="flex items-center justify-between">
              <span>Notification Permission:</span>
              {getPermissionBadge()}
            </div>
            <div className="flex items-center justify-between">
              <span>Service Worker Ready:</span>
              <Badge className={status.serviceWorkerReady ? "bg-green-500" : "bg-red-500"}>
                {status.serviceWorkerReady ? 'Ready' : 'Not Ready'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Push Subscribed:</span>
              <Badge className={status.subscribed ? "bg-green-500" : "bg-red-500"}>
                {status.subscribed ? 'Subscribed' : 'Not Subscribed'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>VAPID Key Available:</span>
              <Badge className={status.vapidKey ? "bg-green-500" : "bg-red-500"}>
                {status.vapidKey ? 'Available' : 'Not Available'}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <Button onClick={handleRequestPermission} disabled={status.permission === 'granted'}>
              Request Permission
            </Button>
            <Button onClick={handleSubscribe} disabled={!status.vapidKey || status.subscribed}>
              Subscribe to Push
            </Button>
            <Button onClick={handleInitializeAll} variant="outline">
              Initialize All
            </Button>
            <Button onClick={handleTestNotification} disabled={status.permission !== 'granted'}>
              Test Local Notification
            </Button>
          </div>
          
          {status.vapidKey && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">VAPID Public Key:</h4>
              <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                {status.vapidKey.substring(0, 50)}...
              </code>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-sm">No test results yet</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-xs font-mono bg-gray-50 p-2 rounded">
                  {result}
                </div>
              ))
            )}
          </div>
          <Button 
            onClick={() => setTestResults([])} 
            variant="outline" 
            size="sm" 
            className="mt-4"
          >
            Clear Results
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}