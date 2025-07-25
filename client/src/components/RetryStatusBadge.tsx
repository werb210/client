/**
 * ✅ RETRY STATUS BADGE
 * Shows pending retry count in dashboard with manual retry option
 */

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, AlertCircle, CheckCircle, Download, Trash2 } from 'lucide-react';
import { 
  getPendingRetryCount, 
  getRetryQueueSummary, 
  processRetryQueue,
  exportDebugLogs,
  clearRetryQueue,
  getRetryQueue,
  type QueuedApplication
} from '@/utils/applicationRetryQueue';

interface RetryStatusBadgeProps {
  compact?: boolean;
}

export function RetryStatusBadge({ compact = false }: RetryStatusBadgeProps) {
  const [pendingCount, setPendingCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [summary, setSummary] = useState({ total: 0, applications: 0, uploads: 0, finalizations: 0 });
  const [queueItems, setQueueItems] = useState<QueuedApplication[]>([]);
  const { toast } = useToast();

  // Update retry count periodically
  useEffect(() => {
    const updateCounts = () => {
      setPendingCount(getPendingRetryCount());
      setSummary(getRetryQueueSummary());
      setQueueItems(getRetryQueue());
    };

    updateCounts();
    const interval = setInterval(updateCounts, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleManualRetry = async () => {
    setIsRetrying(true);
    
    try {
      const results = await processRetryQueue();
      
      if (results.success > 0 || results.failed > 0) {
        toast({
          title: "Retry Complete",
          description: `${results.success} successful, ${results.failed} failed`,
          variant: results.success > 0 ? "default" : "destructive"
        });
      } else {
        toast({
          title: "No Items to Retry",
          description: "Queue is empty or API unavailable",
        });
      }
      
      // Update counts after retry
      setPendingCount(getPendingRetryCount());
      setSummary(getRetryQueueSummary());
      setQueueItems(getRetryQueue());
      
    } catch (error) {
      toast({
        title: "Retry Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleExportLogs = () => {
    try {
      const logs = exportDebugLogs();
      const blob = new Blob([logs], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `boreal-debug-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Debug Logs Exported",
        description: "Send this file to staff support for assistance"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export debug logs",
        variant: "destructive"
      });
    }
  };

  const handleClearQueue = () => {
    clearRetryQueue();
    setPendingCount(0);
    setSummary({ total: 0, applications: 0, uploads: 0, finalizations: 0 });
    setQueueItems([]);
    
    toast({
      title: "Queue Cleared",
      description: "All retry items have been removed"
    });
  };

  if (pendingCount === 0 && compact) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <AlertCircle className="w-3 h-3 mr-1" />
          {pendingCount} retry pending
        </Badge>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs"
        >
          Details
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingCount > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700">
            <div className="flex items-center justify-between">
              <span>
                {pendingCount} application submission{pendingCount > 1 ? 's' : ''} pending retry
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualRetry}
                  disabled={isRetrying}
                  className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200"
                >
                  {isRetrying ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Retry Now
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-yellow-800"
                >
                  {showDetails ? 'Hide' : 'Show'} Details
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {showDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Retry Queue Details</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportLogs}
                  className="text-blue-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Logs
                </Button>
                {pendingCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearQueue}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Queue
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
                  <div className="text-sm text-gray-600">Total Items</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-900">{summary.applications}</div>
                  <div className="text-sm text-blue-600">Applications</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-900">{summary.uploads}</div>
                  <div className="text-sm text-green-600">Uploads</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded">
                  <div className="text-2xl font-bold text-purple-900">{summary.finalizations}</div>
                  <div className="text-sm text-purple-600">Finalizations</div>
                </div>
              </div>

              {/* Queue Items */}
              {queueItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Queued Items:</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {queueItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 border border-gray-200 rounded bg-white"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {item.type}
                              </Badge>
                              {item.fileName && (
                                <span className="text-sm text-gray-600">{item.fileName}</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              App ID: {item.applicationId}
                            </div>
                            <div className="text-xs text-gray-500">
                              Added: {new Date(item.timestamp).toLocaleString()}
                            </div>
                            {item.error && (
                              <div className="text-xs text-red-500 mt-1">
                                Error: {item.error}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              Attempts: {item.retryCount}
                            </div>
                            {item.lastAttempt && (
                              <div className="text-xs text-gray-500">
                                Last: {new Date(item.lastAttempt).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {queueItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>No items in retry queue</p>
                  <p className="text-sm">All submissions are up to date</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}