// client/src/components/ProductionHealthBanner.tsx
import { useEffect, useState } from 'react';
import { checkApiHealth } from '../config/api';

export default function ProductionHealthBanner() {
  const [apiHealth, setApiHealth] = useState<boolean | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      const isHealthy = await checkApiHealth();
      setApiHealth(isHealthy);
      setIsVisible(!isHealthy); // Show banner only if API is down
    };

    // Initial check
    checkHealth();

    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible || apiHealth === null) return null;

  return (
    <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Production API Unavailable
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              We're experiencing connectivity issues with our production API. 
              Some features may be limited. Please try again in a few minutes.
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={() => setIsVisible(false)}
              className="bg-red-100 px-2 py-1 rounded text-sm text-red-800 hover:bg-red-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}