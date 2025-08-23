import { useEffect, useState } from 'react';
import { useLenderProducts } from '@/hooks/useLenderProducts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';

export function LenderProductSyncStatus() {
  const { data: products, isLoading, isError, refetch, dataUpdatedAt } = useLenderProducts();
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'online' | 'offline' | 'syncing'>('online');
  
  useEffect(() => {
    if (dataUpdatedAt) {
      setLastSyncTime(new Date(dataUpdatedAt).toLocaleTimeString());
    }
  }, [dataUpdatedAt]);

  const handleManualSync = async () => {
    setSyncStatus('syncing');
    try {
      await refetch();
      setSyncStatus('online');
    } catch (error) {
      setSyncStatus('offline');
    }
  };

  const getSyncStatusBadge = () => {
    if (isLoading || syncStatus === 'syncing') {
      return <Badge variant="outline" className="animate-pulse">🔄 Syncing</Badge>;
    }
    
    if (isError || syncStatus === 'offline') {
      return <Badge variant="destructive"><WifiOff className="w-3 h-3 mr-1" />Offline</Badge>;
    }
    
    return <Badge variant="default" className="bg-green-600"><Wifi className="w-3 h-3 mr-1" />Live</Badge>;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          Lender Products Sync
          {getSyncStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Products:</span>
            <span className="font-mono">{products?.length || 0}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Last sync:</span>
            <span className="text-xs text-gray-500">
              {lastSyncTime || 'Not synced'}
            </span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualSync}
            disabled={isLoading || syncStatus === 'syncing'}
            className="w-full"
          >
            <RefreshCw className={`w-3 h-3 mr-2 ${(isLoading || syncStatus === 'syncing') ? 'animate-spin' : ''}`} />
            {syncStatus === 'syncing' ? 'Syncing...' : 'Refresh Products'}
          </Button>
          
          <div className="text-xs text-gray-500 text-center">
            {syncStatus === 'online' && '✅ Real-time sync active'}
            {syncStatus === 'offline' && '⚠️ Using cached data'}
            {syncStatus === 'syncing' && '🔄 Syncing with staff app...'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}