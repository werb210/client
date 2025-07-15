import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { triggerManualSync, getSchedulerStatus } from '@/jobs/scheduler';
import { getSyncStats } from '@/db/lenderProducts';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Database from 'lucide-react/dist/esm/icons/database';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import XCircle from 'lucide-react/dist/esm/icons/x-circle';

export default function SyncMonitor() {
  const [syncStats, setSyncStats] = useState<any>(null);
  const [schedulerStatus, setSchedulerStatus] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastManualSync, setLastManualSync] = useState<any>(null);

  const loadStats = async () => {
    try {
      const stats = await getSyncStats();
      const status = getSchedulerStatus();
      setSyncStats(stats);
      setSchedulerStatus(status);
    } catch (error) {
      console.error('Failed to load sync stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      // console.log('Triggering manual sync...');
      const result = await triggerManualSync();
      setLastManualSync(result);
      await loadStats(); // Refresh stats after sync
    } catch (error) {
      console.error('Manual sync failed:', error);
      setLastManualSync({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setSyncing(false);
    }
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  const getNextSyncTime = () => {
    const now = new Date();
    const mstNow = new Date(now.getTime() - (7 * 60 * 60 * 1000));
    const currentHour = mstNow.getHours();
    
    let nextSync = new Date(mstNow);
    if (currentHour < 12) {
      nextSync.setHours(12, 0, 0, 0);
    } else {
      nextSync.setDate(nextSync.getDate() + 1);
      nextSync.setHours(0, 0, 0, 0);
    }
    
    return nextSync.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-teal-600 to-teal-700 text-white">
            <CardTitle className="text-2xl font-bold">Lender Product Sync Monitor</CardTitle>
            <p className="text-teal-100">Monitor and manage automated product synchronization</p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Sync Status */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-teal-600" />
                  <h3 className="text-lg font-semibold">Sync Status</h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Scheduler Status</span>
                      {schedulerStatus?.isRunning ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm">Running</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600">
                          <XCircle className="w-4 h-4" />
                          <span className="text-sm">Stopped</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Runs twice daily at 12:00 PM and 12:00 AM MST
                    </p>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Last Sync</span>
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatTime(syncStats?.lastSyncTime)}
                    </p>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Next Scheduled Sync</span>
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">
                      {getNextSyncTime()}
                    </p>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Total Products</span>
                      <Database className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold text-teal-600">
                      {syncStats?.totalProducts || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Manual Control */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-teal-600" />
                  <h3 className="text-lg font-semibold">Manual Control</h3>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={handleManualSync}
                    disabled={syncing}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                  >
                    {syncing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Trigger Manual Sync
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={loadStats}
                    variant="outline"
                    className="w-full"
                  >
                    Refresh Status
                  </Button>

                  {lastManualSync && (
                    <div className={`border rounded-lg p-4 ${
                      lastManualSync.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <h4 className={`font-medium ${
                        lastManualSync.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        Last Manual Sync
                      </h4>
                      <p className={`text-sm ${
                        lastManualSync.success ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {lastManualSync.success 
                          ? `Success: ${lastManualSync.changes} changes, ${lastManualSync.total} total products from ${lastManualSync.source}`
                          : `Failed: ${lastManualSync.error}`
                        }
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTime(lastManualSync.timestamp)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Types Breakdown */}
            {syncStats?.productsByType && Object.keys(syncStats.productsByType).length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Products by Type</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(syncStats.productsByType).map(([type, count]) => (
                    <div key={type} className="bg-white border rounded-lg p-3 text-center">
                      <div className="text-lg font-semibold text-teal-600">{count as number}</div>
                      <div className="text-sm text-gray-600 capitalize">
                        {type.replace(/_/g, ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">How it works</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Automatically syncs with staff API twice daily (12 PM and 12 AM MST)</li>
                <li>• Compares remote products with local storage and updates only changed items</li>
                <li>• Falls back to local 8-product dataset when staff API is unavailable</li>
                <li>• Stores products in IndexedDB for offline access and faster loading</li>
                <li>• Use manual sync to test connectivity or force immediate update</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}