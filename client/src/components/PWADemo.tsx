/**
 * PWA Features Demonstration Component
 * Shows all PWA capabilities working in the application
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Bell, 
  Download, 
  Upload, 
  MessageCircle,
  Camera,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { 
  usePWAInstall, 
  useNetworkStatus, 
  usePushNotifications, 
  useOfflineForm,
  useServiceWorker 
} from '@/hooks/usePWA';

export function PWADemo() {
  const { canInstall, isInstalled, install } = usePWAInstall();
  const { isOnline } = useNetworkStatus();
  const { isSupported, hasPermission, subscribe } = usePushNotifications();
  const { isRegistered, updateAvailable, updateApp } = useServiceWorker();
  const { saveFormData, loadFormData } = useOfflineForm(1);
  
  const [demoData, setDemoData] = useState({ businessName: '', email: '' });
  const [showDemo, setShowDemo] = useState(false);

  const features = [
    {
      name: 'App Installation',
      icon: Smartphone,
      status: isInstalled ? 'installed' : (canInstall ? 'available' : 'pending'),
      description: 'Install as native app on device',
      action: canInstall ? () => install() : undefined,
      actionText: 'Install Now'
    },
    {
      name: 'Network Status',
      icon: isOnline ? Wifi : WifiOff,
      status: isOnline ? 'online' : 'offline',
      description: 'Real-time connectivity monitoring',
      color: isOnline ? 'green' : 'red'
    },
    {
      name: 'Push Notifications',
      icon: Bell,
      status: hasPermission ? 'enabled' : (isSupported ? 'available' : 'unsupported'),
      description: 'Document reminders and status updates',
      action: !hasPermission && isSupported ? () => subscribe() : undefined,
      actionText: 'Enable Notifications'
    },
    {
      name: 'Offline Storage',
      icon: Download,
      status: 'active',
      description: 'Form data saved locally',
      action: () => testOfflineStorage(),
      actionText: 'Test Storage'
    },
    {
      name: 'Background Sync',
      icon: RefreshCw,
      status: isRegistered ? 'active' : 'pending',
      description: 'Auto-sync when connection returns',
      color: isRegistered ? 'green' : 'yellow'
    },
    {
      name: 'Service Worker',
      icon: CheckCircle,
      status: isRegistered ? 'registered' : 'pending',
      description: 'Offline functionality and caching',
      action: updateAvailable ? () => updateApp() : undefined,
      actionText: updateAvailable ? 'Update Available' : undefined,
      color: isRegistered ? 'green' : 'red'
    }
  ];

  const testOfflineStorage = async () => {
    const testData = {
      businessName: 'Test Business Inc.',
      email: 'test@business.com',
      timestamp: new Date().toISOString()
    };
    
    await saveFormData(testData);
    const loaded = await loadFormData();
    setDemoData(loaded || {});
    
    alert('Offline storage test completed! Check console for details.');
  };

  const getStatusColor = (status: string, color?: string) => {
    if (color) return color;
    
    switch (status) {
      case 'installed':
      case 'enabled':
      case 'active':
      case 'registered':
      case 'online':
        return 'green';
      case 'available':
        return 'blue';
      case 'offline':
      case 'pending':
        return 'yellow';
      case 'unsupported':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'installed':
      case 'enabled':
      case 'active':
      case 'registered':
      case 'online':
        return CheckCircle;
      case 'offline':
      case 'unsupported':
        return AlertCircle;
      default:
        return AlertCircle;
    }
  };

  if (!showDemo) {
    return (
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          onClick={() => setShowDemo(true)}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
        >
          PWA Demo
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Smartphone className="w-5 h-5 text-teal-600" />
                <span>PWA Features Demo</span>
              </CardTitle>
              <CardDescription>
                Progressive Web App capabilities for Boreal Financial
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDemo(false)}
            >
              Close
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {features.map((feature) => {
              const StatusIcon = getStatusIcon(feature.status);
              const FeatureIcon = feature.icon;
              const statusColor = getStatusColor(feature.status, feature.color);
              
              return (
                <div
                  key={feature.name}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <FeatureIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{feature.name}</h4>
                        <Badge 
                          variant="outline"
                          className={`text-xs ${
                            statusColor === 'green' ? 'border-green-500 text-green-700' :
                            statusColor === 'blue' ? 'border-blue-500 text-blue-700' :
                            statusColor === 'yellow' ? 'border-yellow-500 text-yellow-700' :
                            statusColor === 'red' ? 'border-red-500 text-red-700' :
                            'border-gray-500 text-gray-700'
                          }`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {feature.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                  
                  {feature.action && feature.actionText && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={feature.action}
                      className="ml-4"
                    >
                      {feature.actionText}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">PWA Benefits for Users:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Install on phone/desktop like a native app</li>
              <li>• Work offline and sync when connection returns</li>
              <li>• Receive push notifications for document requirements</li>
              <li>• Camera access for document scanning</li>
              <li>• Fast loading with cached resources</li>
              <li>• Automatic updates in background</li>
            </ul>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Test Scenarios:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <Button variant="outline" size="sm" onClick={testOfflineStorage}>
                <Download className="w-4 h-4 mr-2" />
                Test Offline Storage
              </Button>
              <Button variant="outline" size="sm" disabled>
                <Camera className="w-4 h-4 mr-2" />
                Test Camera Upload
              </Button>
              <Button variant="outline" size="sm" disabled>
                <MessageCircle className="w-4 h-4 mr-2" />
                Test Chat Offline
              </Button>
              <Button variant="outline" size="sm" disabled>
                <Bell className="w-4 h-4 mr-2" />
                Test Push Notification
              </Button>
            </div>
          </div>

          {demoData.businessName && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Last Offline Storage Test:</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded">
                {JSON.stringify(demoData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}