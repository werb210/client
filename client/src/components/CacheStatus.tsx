import { useState, useEffect } from 'react';
import { getCacheMetadata } from '@/lib/syncLenderProducts';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Clock, Database } from 'lucide-react';

export function CacheStatus() {
  const [metadata, setMetadata] = useState<{
    lastFetched: number | null;
    totalProducts: number;
    isStale: boolean;
  } | null>(null);

  useEffect(() => {
    const checkCacheStatus = async () => {
      const data = await getCacheMetadata();
      setMetadata(data);
    };

    checkCacheStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkCacheStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!metadata) return null;

  const formatLastFetched = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      <Database className="h-3 w-3" />
      <span>{metadata.totalProducts} products cached</span>
      
      {metadata.isStale ? (
        <Badge variant="outline" className="flex items-center gap-1 h-5">
          <Clock className="h-2 w-2" />
          Syncing...
        </Badge>
      ) : (
        <Badge variant="outline" className="flex items-center gap-1 h-5 bg-green-50 border-green-200 text-green-700">
          <Wifi className="h-2 w-2" />
          Fresh
        </Badge>
      )}
      
      <span>Last: {formatLastFetched(metadata.lastFetched)}</span>
    </div>
  );
}