/**
 * PWA Notification Manager Component
 * Handles push notification subscription and management
 */

import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface NotificationManagerState {
  isSupported: boolean;
  isSubscribed: boolean;
  subscription: PushSubscription | null;
  permission: NotificationPermission;
  isLoading: boolean;
}

interface NotificationPreferences {
  documentRequired: boolean;
  agentResponse: boolean;
  applicationUpdate: boolean;
  general: boolean;
}

export default function PWANotificationManager() {
  const { toast } = useToast();
  const [state, setState] = useState<NotificationManagerState>({
    isSupported: false,
    isSubscribed: false,
    subscription: null,
    permission: 'default',
    isLoading: false
  });

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    documentRequired: true,
    agentResponse: true,
    applicationUpdate: true,
    general: false
  });

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    // Check if service workers and push messaging are supported
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported in this browser');
      return;
    }

    setState(prev => ({ ...prev, isSupported: true, permission: Notification.permission }));

    // Check if already subscribed
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setState(prev => ({
        ...prev,
        isSubscribed: !!subscription,
        subscription: subscription
      }));

      // Load preferences from localStorage
      const savedPreferences = localStorage.getItem('notification-preferences');
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    } catch (error) {
      console.error('Error checking notification subscription:', error);
    }
  };

  const requestPermissionAndSubscribe = async () => {
    if (!state.isSupported) {
      toast({
        title: 'Not Supported',
        description: 'Push notifications are not supported in this browser',
        variant: 'destructive'
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast({
          title: 'Permission Denied',
          description: 'Please enable notifications in your browser settings',
          variant: 'destructive'
        });
        setState(prev => ({ ...prev, permission, isLoading: false }));
        return;
      }

      // Get VAPID public key from server
      const vapidResponse = await fetch('/api/vapid-public-key');
      if (!vapidResponse.ok) {
        throw new Error('Failed to get VAPID public key');
      }
      const { publicKey } = await vapidResponse.json();

      // Subscribe to push notifications
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });

      // Send subscription to server
      const subscribeResponse = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
          applicationId: localStorage.getItem('applicationId') // If available
        })
      });

      if (!subscribeResponse.ok) {
        throw new Error('Failed to save subscription on server');
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        subscription,
        permission,
        isLoading: false
      }));

      // Send welcome notification
      await sendTestNotification('welcome');

      toast({
        title: 'Notifications Enabled',
        description: 'You\'ll receive important updates about your application'
      });
    } catch (error) {
      console.error('Push subscription failed:', error);
      toast({
        title: 'Subscription Failed',
        description: 'Unable to enable push notifications. Please try again.',
        variant: 'destructive'
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const unsubscribe = async () => {
    if (!state.subscription) return;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Unsubscribe from push manager
      await state.subscription.unsubscribe();

      // Remove from server
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: state.subscription.endpoint
        })
      });

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        subscription: null,
        isLoading: false
      }));

      toast({
        title: 'Notifications Disabled',
        description: 'You will no longer receive push notifications'
      });
    } catch (error) {
      console.error('Unsubscribe failed:', error);
      toast({
        title: 'Unsubscribe Failed',
        description: 'Unable to disable notifications. Please try again.',
        variant: 'destructive'
      });
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const sendTestNotification = async (type: string = 'general') => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          applicationId: localStorage.getItem('applicationId')
        })
      });

      const result = await response.json();
      if (result.success) {
        toast({
          title: 'Test Sent',
          description: `Test notification sent successfully`
        });
      }
    } catch (error) {
      console.error('Test notification failed:', error);
    }
  };

  const updatePreferences = (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    localStorage.setItem('notification-preferences', JSON.stringify(newPreferences));
  };

  if (!state.isSupported) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notifications Not Available
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in this browser
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {state.isSubscribed ? (
            <Bell className="h-5 w-5 text-green-600" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-400" />
          )}
          Push Notifications
        </CardTitle>
        <CardDescription>
          {state.isSubscribed 
            ? 'Get notified about application updates and messages'
            : 'Enable notifications to stay updated on your application'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">
              {state.isSubscribed ? 'Notifications Enabled' : 'Enable Notifications'}
            </Label>
            <p className="text-xs text-muted-foreground">
              {state.permission === 'denied' 
                ? 'Blocked in browser settings'
                : state.isSubscribed 
                  ? 'Active and ready'
                  : 'Click to enable'
              }
            </p>
          </div>
          
          {state.permission === 'denied' ? (
            <Button variant="outline" size="sm" disabled>
              Blocked
            </Button>
          ) : state.isSubscribed ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={unsubscribe}
              disabled={state.isLoading}
            >
              Disable
            </Button>
          ) : (
            <Button 
              size="sm" 
              onClick={requestPermissionAndSubscribe}
              disabled={state.isLoading}
            >
              {state.isLoading ? 'Enabling...' : 'Enable'}
            </Button>
          )}
        </div>

        {/* Settings Toggle */}
        {state.isSubscribed && (
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="w-full justify-start"
            >
              <Settings className="h-4 w-4 mr-2" />
              Notification Preferences
            </Button>
          </div>
        )}

        {/* Preferences */}
        {state.isSubscribed && showSettings && (
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label htmlFor="document-required" className="text-sm">
                Document Required
              </Label>
              <Switch
                id="document-required"
                checked={preferences.documentRequired}
                onCheckedChange={(checked) => updatePreferences('documentRequired', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="agent-response" className="text-sm">
                Agent Messages
              </Label>
              <Switch
                id="agent-response"
                checked={preferences.agentResponse}
                onCheckedChange={(checked) => updatePreferences('agentResponse', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="application-update" className="text-sm">
                Status Updates
              </Label>
              <Switch
                id="application-update"
                checked={preferences.applicationUpdate}
                onCheckedChange={(checked) => updatePreferences('applicationUpdate', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="general" className="text-sm">
                General Notifications
              </Label>
              <Switch
                id="general"
                checked={preferences.general}
                onCheckedChange={(checked) => updatePreferences('general', checked)}
              />
            </div>

            {/* Test Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => sendTestNotification()}
              className="w-full mt-3"
            >
              Send Test Notification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}