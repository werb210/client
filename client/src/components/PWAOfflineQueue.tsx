/**
 * PWA Offline Queue Component
 * Handles offline form submissions and document uploads with retry logic
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CloudOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Upload,
  FileText
} from 'lucide-react';
import { useNetworkStatus } from '@/hooks/usePWA';

interface QueueItem {
  id: string;
  type: 'form' | 'document';
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  data: any;
  timestamp: number;
  retryCount: number;
  error?: string;
}

export function PWAOfflineQueue() {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    loadQueueFromStorage();
    
    // Listen for queue updates from service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);

  useEffect(() => {
    // Auto-sync when connection is restored
    if (isOnline && queueItems.some(item => item.status === 'pending')) {
      syncQueue();
    }
  }, [isOnline, queueItems]);

  const handleServiceWorkerMessage = (event: MessageEvent) => {
    const { type, data } = event.data;
    
    switch (type) {
      case 'QUEUE_UPDATED':
        loadQueueFromStorage();
        break;
      case 'SYNC_PROGRESS':
        setSyncProgress(data.progress);
        break;
      case 'SYNC_COMPLETE':
        setSyncProgress(100);
        setTimeout(() => setSyncProgress(0), 2000);
        loadQueueFromStorage();
        break;
    }
  };

  const loadQueueFromStorage = async () => {
    try {
      const stored = localStorage.getItem('pwa-offline-queue');
      if (stored) {
        setQueueItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load queue from storage:', error);
    }
  };

  const syncQueue = async () => {
    const pendingItems = queueItems.filter(item => item.status === 'pending');
    
    for (const item of pendingItems) {
      try {
        setQueueItems(prev => prev.map(i => 
          i.id === item.id ? { ...i, status: 'syncing' } : i
        ));

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setQueueItems(prev => prev.map(i => 
          i.id === item.id ? { ...i, status: 'completed' } : i
        ));
        
      } catch (error) {
        setQueueItems(prev => prev.map(i => 
          i.id === item.id ? { 
            ...i, 
            status: 'failed', 
            retryCount: i.retryCount + 1,
            error: error instanceof Error ? error.message : 'Sync failed'
          } : i
        ));
      }
    }
  };

  const retryItem = async (itemId: string) => {
    const item = queueItems.find(i => i.id === itemId);
    if (!item) return;

    try {
      setQueueItems(prev => prev.map(i => 
        i.id === itemId ? { ...i, status: 'syncing', error: undefined } : i
      ));

      // Simulate retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setQueueItems(prev => prev.map(i => 
        i.id === itemId ? { ...i, status: 'completed' } : i
      ));
      
    } catch (error) {
      setQueueItems(prev => prev.map(i => 
        i.id === itemId ? { 
          ...i, 
          status: 'failed',
          retryCount: i.retryCount + 1,
          error: error instanceof Error ? error.message : 'Retry failed'
        } : i
      ));
    }
  };

  const clearCompleted = () => {
    setQueueItems(prev => prev.filter(item => item.status !== 'completed'));
    localStorage.setItem('pwa-offline-queue', JSON.stringify(
      queueItems.filter(item => item.status !== 'completed')
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-yellow-500 text-yellow-700';
      case 'syncing':
        return 'border-blue-500 text-blue-700';
      case 'completed':
        return 'border-green-500 text-green-700';
      case 'failed':
        return 'border-red-500 text-red-700';
      default:
        return 'border-gray-500 text-gray-700';
    }
  };

  const pendingCount = queueItems.filter(item => item.status === 'pending').length;
  const failedCount = queueItems.filter(item => item.status === 'failed').length;

  if (queueItems.length === 0) return null;

  return (
    <>
      {/* Queue Status Indicator */}
      <div className="fixed bottom-24 right-4 z-40">
        <Button
          onClick={() => setIsVisible(!isVisible)}
          size="sm"
          variant={pendingCount > 0 || failedCount > 0 ? "default" : "outline"}
          className={`relative ${
            pendingCount > 0 ? 'bg-yellow-600 hover:bg-yellow-700' :
            failedCount > 0 ? 'bg-red-600 hover:bg-red-700' :
            'bg-green-600 hover:bg-green-700'
          }`}
        >
          <CloudOff className="w-4 h-4 mr-2" />
          Queue ({queueItems.length})
          {(pendingCount > 0 || failedCount > 0) && (
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {pendingCount + failedCount}
            </div>
          )}
        </Button>
      </div>

      {/* Queue Panel */}
      {isVisible && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
          <Card className="w-full max-w-md max-h-[70vh] overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <CloudOff className="w-5 h-5" />
                  <span>Offline Queue</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVisible(false)}
                >
                  ×
                </Button>
              </div>
              
              {syncProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Syncing...</span>
                    <span>{syncProgress}%</span>
                  </div>
                  <Progress value={syncProgress} className="h-2" />
                </div>
              )}
            </CardHeader>
            
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {queueItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {item.type === 'form' ? (
                      <FileText className="w-5 h-5 text-gray-500" />
                    ) : (
                      <Upload className="w-5 h-5 text-gray-500" />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">
                          {item.type === 'form' ? 'Form Data' : 'Document'}
                        </span>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1">{item.status}</span>
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">
                        {new Date(item.timestamp).toLocaleTimeString()}
                        {item.retryCount > 0 && ` • ${item.retryCount} retries`}
                      </p>
                      {item.error && (
                        <p className="text-xs text-red-600 mt-1">{item.error}</p>
                      )}
                    </div>
                  </div>
                  
                  {item.status === 'failed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => retryItem(item.id)}
                      disabled={!isOnline}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry
                    </Button>
                  )}
                </div>
              ))}
              
              <div className="flex justify-between pt-3 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={syncQueue}
                  disabled={!isOnline || pendingCount === 0}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync All
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearCompleted}
                  disabled={queueItems.every(item => item.status !== 'completed')}
                >
                  Clear Completed
                </Button>
              </div>
              
              {!isOnline && (
                <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <CloudOff className="w-4 h-4 mx-auto mb-1" />
                  Items will sync automatically when connection returns
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

// Add queue item utility function
export const addToOfflineQueue = (type: 'form' | 'document', data: any) => {
  const queueItem: QueueItem = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    status: 'pending',
    data,
    timestamp: Date.now(),
    retryCount: 0
  };

  try {
    const existing = JSON.parse(localStorage.getItem('pwa-offline-queue') || '[]');
    const updated = [...existing, queueItem];
    localStorage.setItem('pwa-offline-queue', JSON.stringify(updated));
    
    // Notify service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'QUEUE_ITEM_ADDED',
        data: queueItem
      });
    }
    
    console.log(`Added ${type} to offline queue:`, queueItem.id);
  } catch (error) {
    console.error('Failed to add item to offline queue:', error);
  }
};