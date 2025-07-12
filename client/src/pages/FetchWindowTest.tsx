import React, { useState, useEffect } from 'react';
import { FetchWindowDebugPanel } from '../components/FetchWindowDebugPanel';
import { fetchLenderProducts } from '../api/lenderProducts';
import { getFetchWindowInfo } from '../utils/fetchWindow';

/**
 * Test page for fetch window control functionality
 * Demonstrates scheduled fetching with cache management
 */
export function FetchWindowTest() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [fetchCount, setFetchCount] = useState(0);
  const [windowInfo, setWindowInfo] = useState(getFetchWindowInfo());
  
  // Update window info every second
  useEffect(() => {
    const interval = setInterval(() => {
      setWindowInfo(getFetchWindowInfo());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleFetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchLenderProducts();
      setProducts(result);
      setLastFetchTime(new Date());
      setFetchCount(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
            🕒 Fetch Window Control Test
          </h1>
          
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            This page demonstrates the scheduled fetch window control system that limits API calls to twice daily (12:00 PM and 12:00 AM MST).
          </p>
          
          {/* Debug Panel */}
          <FetchWindowDebugPanel 
            lastFetchTime={lastFetchTime}
            cachedProductCount={products.length}
            cacheSource="staff API"
          />
          
          {/* Manual Test Controls */}
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">
              Manual Testing
            </h3>
            
            <div className="flex gap-4 items-center mb-4">
              <button
                onClick={handleFetchProducts}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Fetching...' : 'Fetch Products'}
              </button>
              
              <span className="text-slate-600 dark:text-slate-400">
                Total fetches this session: {fetchCount}
              </span>
            </div>
            
            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm mb-4">
                ❌ Error: {error}
              </div>
            )}
          </div>
          
          {/* Results Summary */}
          {products.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                ✅ Products Loaded
              </h3>
              <div className="text-green-700 dark:text-green-400 text-sm">
                Successfully loaded {products.length} lender products
              </div>
              {lastFetchTime && (
                <div className="text-green-600 dark:text-green-400 text-sm">
                  Last fetch: {lastFetchTime.toLocaleString()}
                </div>
              )}
            </div>
          )}
          
          {/* Expected Behavior */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
              📋 Expected Behavior
            </h3>
            <ul className="text-blue-700 dark:text-blue-400 text-sm space-y-1">
              <li>• <strong>During fetch windows (12:00 AM/PM MST):</strong> API calls are allowed</li>
              <li>• <strong>Outside fetch windows:</strong> Uses cached data if available</li>
              <li>• <strong>No cache available:</strong> Forces API fetch despite window restrictions</li>
              <li>• <strong>API failure with cache:</strong> Falls back to cached data</li>
            </ul>
          </div>
          
          {/* Current Window Status */}
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
              🚦 Current Status
            </h3>
            <div className="text-yellow-700 dark:text-yellow-400 text-sm">
              {windowInfo.isAllowed ? (
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  API fetching is currently ALLOWED
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                  API fetching is currently BLOCKED (using cache)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}