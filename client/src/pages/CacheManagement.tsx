import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CacheManager, IntegrationVerifier, CacheStatus } from '@/utils/cacheManager';
import { RefreshCw, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

export default function CacheManagement() {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastCleared, setLastCleared] = useState<Date | null>(null);

  const refreshStatus = async () => {
    const status = await CacheManager.getCacheStatus();
    setCacheStatus(status);
  };

  const clearAllCache = async () => {
    setIsClearing(true);
    try {
      await CacheManager.clearAllCache();
      setLastCleared(new Date());
      await refreshStatus();
    } catch (error) {
      console.error('Cache clearing failed:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const runIntegrationCheck = async () => {
    setIsVerifying(true);
    try {
      await IntegrationVerifier.runIntegrationCheck();
    } catch (error) {
      console.error('Integration check failed:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const isCleanState = cacheStatus && 
    cacheStatus.localStorage === 0 && 
    cacheStatus.sessionStorage === 0 && 
    cacheStatus.cookies === 0 && 
    cacheStatus.indexedDB.length === 0 &&
    cacheStatus.applicationId === null &&
    cacheStatus.tokens.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Cache Management</h1>
          <p className="text-gray-600">
            Clear client-side storage and verify integration status
          </p>
        </div>

        {/* Cache Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Cache Status
              <Badge variant={isCleanState ? "default" : "destructive"}>
                {isCleanState ? "Clean" : "Has Data"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cacheStatus && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">localStorage:</span>
                    <Badge variant="outline">{cacheStatus.localStorage} items</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">sessionStorage:</span>
                    <Badge variant="outline">{cacheStatus.sessionStorage} items</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Cookies:</span>
                    <Badge variant="outline">{cacheStatus.cookies} items</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">IndexedDB:</span>
                    <Badge variant="outline">{cacheStatus.indexedDB.length} databases</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Application ID:</span>
                    <Badge variant={cacheStatus.applicationId ? "destructive" : "default"}>
                      {cacheStatus.applicationId ? "Present" : "None"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Auth Tokens:</span>
                    <Badge variant={cacheStatus.tokens.length > 0 ? "destructive" : "default"}>
                      {cacheStatus.tokens.length} tokens
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {cacheStatus?.tokens && cacheStatus.tokens.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Found Authentication Tokens:</h4>
                <div className="text-sm text-yellow-700 space-y-1">
                  {cacheStatus.tokens.map((token, idx) => (
                    <div key={idx} className="font-mono">{token}</div>
                  ))}
                </div>
              </div>
            )}

            {cacheStatus?.applicationId && (
              <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2">Application ID Found:</h4>
                <div className="text-sm text-orange-700 font-mono">{cacheStatus.applicationId}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Cache Management Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={refreshStatus} 
                variant="outline"
                disabled={isClearing || isVerifying}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Status
              </Button>
              
              <Button 
                onClick={clearAllCache}
                variant="destructive"
                disabled={isClearing || isVerifying}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isClearing ? 'Clearing...' : 'Clear All Cache'}
              </Button>
              
              <Button 
                onClick={runIntegrationCheck}
                variant="default"
                disabled={isClearing || isVerifying}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isVerifying ? 'Verifying...' : 'Integration Check'}
              </Button>
            </div>

            {lastCleared && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Cache cleared successfully</span>
                </div>
                <div className="text-sm text-green-700 mt-1">
                  Last cleared: {lastCleared.toLocaleString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Troubleshooting Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">For Staff App Issues:</h4>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>Click "Clear All Cache" above</li>
                  <li>Close this tab completely</li>
                  <li>Open new incognito/private window</li>
                  <li>Navigate to https://staff.boreal.financial</li>
                  <li>Verify login page shows without errors</li>
                </ol>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">Integration Verification:</h4>
                <ul className="list-disc list-inside space-y-1 text-purple-700">
                  <li>Staff Portal should be accessible without error</li>
                  <li>App.tsx console should show "CACHE BYPASS"</li>
                  <li>No React Router warnings in console</li>
                  <li>GET /api/public/lenders returns 200 with product data</li>
                </ul>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Console Commands:</h4>
                <div className="space-y-1 text-gray-700 font-mono text-xs">
                  <div>// Clear cache: await window.CacheManager.clearAllCache()</div>
                  <div>// Check status: await window.CacheManager.getCacheStatus()</div>
                  <div>// Run integration: await window.IntegrationVerifier.runIntegrationCheck()</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}