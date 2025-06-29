import { useLocalLenderStats } from '@/hooks/useLocalLenders';
import { Badge } from '@/components/ui/badge';
import { Server, CheckCircle, AlertCircle, Database } from 'lucide-react';

export function CacheStatus() {
  const { data: stats, isLoading, error } = useLocalLenderStats();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <Database className="h-3 w-3 animate-pulse" />
        <span>Loading database stats...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-xs text-red-500">
        <AlertCircle className="h-3 w-3" />
        <span>Database connection failed</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      <Server className="h-3 w-3 text-green-600" />
      <span>{stats?.activeProducts || 0} products from database</span>
      
      <Badge variant="outline" className="flex items-center gap-1 h-5 bg-green-50 border-green-200 text-green-700">
        <CheckCircle className="h-2 w-2" />
        Live
      </Badge>
      
      {stats?.productsByType && (
        <span className="text-gray-400">
          {Object.keys(stats.productsByType).length} types
        </span>
      )}
    </div>
  );
}