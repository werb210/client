/**
 * Loading state optimizations for slower connections
 */

import * as React from 'react';

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
  estimatedTime?: number;
}

export interface ConnectionInfo {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

/**
 * Detect connection speed and adjust loading behavior
 */
export function getConnectionInfo(): ConnectionInfo {
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;

  if (connection) {
    return {
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
      saveData: connection.saveData || false
    };
  }

  // Fallback for browsers without Network Information API
  return {
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false
  };
}

/**
 * Adaptive loading strategies based on connection
 */
export function getLoadingStrategy(connectionInfo: ConnectionInfo): LoadingStrategy {
  const { effectiveType, downlink, saveData } = connectionInfo;

  if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
    return {
      preloadImages: false,
      chunkSize: 'small',
      showProgress: true,
      useSkeletons: true,
      deferNonCritical: true,
      optimizeImages: true
    };
  }

  if (effectiveType === '3g' || downlink < 1.5) {
    return {
      preloadImages: false,
      chunkSize: 'medium',
      showProgress: true,
      useSkeletons: true,
      deferNonCritical: true,
      optimizeImages: true
    };
  }

  // Fast connection (4g, wifi)
  return {
    preloadImages: true,
    chunkSize: 'large',
    showProgress: false,
    useSkeletons: false,
    deferNonCritical: false,
    optimizeImages: false
  };
}

export interface LoadingStrategy {
  preloadImages: boolean;
  chunkSize: 'small' | 'medium' | 'large';
  showProgress: boolean;
  useSkeletons: boolean;
  deferNonCritical: boolean;
  optimizeImages: boolean;
}

/**
 * Smart loading component that adapts to connection speed
 */
export function SmartLoader({ 
  children, 
  fallback,
  threshold = 1000 
}: { 
  children: React.ReactNode; 
  fallback: React.ReactNode;
  threshold?: number;
}): React.ReactElement {
  const [isLoading, setIsLoading] = React.useState(true);
  const [connectionInfo] = React.useState(() => getConnectionInfo());
  const strategy = getLoadingStrategy(connectionInfo);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, strategy.chunkSize === 'small' ? threshold * 2 : threshold);

    return () => clearTimeout(timer);
  }, [threshold, strategy.chunkSize]);

  if (isLoading) {
    return React.createElement('div', {}, strategy.useSkeletons ? fallback : 'Loading...');
  }

  return React.createElement(React.Fragment, {}, children);
}

/**
 * Progressive enhancement for slow connections
 */
export function enableProgressiveEnhancement(): void {
  const connectionInfo = getConnectionInfo();
  const strategy = getLoadingStrategy(connectionInfo);

  // Disable non-critical features on slow connections
  if (strategy.deferNonCritical) {
    // Defer animations
    document.documentElement.style.setProperty('--animation-duration', '0s');
    
    // Reduce image quality
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      const src = img.getAttribute('data-src');
      if (src) {
        img.setAttribute('src', `${src}?q=60&w=800`);
      }
    });
  }

  // Show connection-aware messaging
  if (connectionInfo.saveData) {
    const dataSaverNotice = document.createElement('div');
    dataSaverNotice.className = 'bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 text-sm';
    dataSaverNotice.textContent = 'Data saver mode detected. Some features may be limited to reduce data usage.';
    document.body.insertBefore(dataSaverNotice, document.body.firstChild);
  }
}

/**
 * Skeleton loader component generator
 */
export function createSkeletonLoader(config: SkeletonConfig): string {
  const { width = '100%', height = '20px', count = 1, className = '' } = config;
  
  const skeletonItem = `
    <div class="animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}" 
         style="width: ${width}; height: ${height}; margin-bottom: 8px;">
    </div>
  `;
  
  return Array(count).fill(skeletonItem).join('');
}

export interface SkeletonConfig {
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

/**
 * Loading progress estimator
 */
export class LoadingProgressEstimator {
  private startTime: number = Date.now();
  private checkpoints: { time: number; progress: number }[] = [];

  addCheckpoint(progress: number): void {
    this.checkpoints.push({
      time: Date.now() - this.startTime,
      progress
    });
  }

  estimateRemainingTime(currentProgress: number): number {
    if (this.checkpoints.length < 2) return 0;

    const recentCheckpoints = this.checkpoints.slice(-3);
    const avgTimePerPercent = recentCheckpoints.reduce((acc, checkpoint, index) => {
      if (index === 0) return acc;
      const prevCheckpoint = recentCheckpoints[index - 1];
      const timeIncrease = checkpoint.time - prevCheckpoint.time;
      const progressIncrease = checkpoint.progress - prevCheckpoint.progress;
      return acc + (timeIncrease / progressIncrease);
    }, 0) / (recentCheckpoints.length - 1);

    const remainingProgress = 100 - currentProgress;
    return Math.round(remainingProgress * avgTimePerPercent);
  }

  reset(): void {
    this.startTime = Date.now();
    this.checkpoints = [];
  }
}