// client/src/components/SecurityErrorBoundary.tsx - Error boundary with security logging
import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorId: string | null;
  errorTime: Date | null;
}

export class SecurityErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      errorId: null,
      errorTime: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate error ID for tracking (no sensitive data)
    const errorId = Math.random().toString(36).substring(2, 10);
    
    return {
      hasError: true,
      errorId,
      errorTime: new Date()
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log sanitized error info (no sensitive data)
    const sanitizedError = {
      errorId: this.state.errorId,
      message: error.message.substring(0, 200), // Limit message length
      timestamp: this.state.errorTime?.toISOString(),
      component: errorInfo.componentStack?.split('\n')[1]?.trim(),
      url: window.location.pathname,
      userAgent: navigator.userAgent.substring(0, 100)
    };

    console.error('[ERROR BOUNDARY]', sanitizedError);
    
    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Send error to Sentry for monitoring
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(error, {
          tags: {
            component: 'SecurityErrorBoundary',
            errorBoundary: true,
          },
          extra: {
            errorInfo: errorInfo,
            componentStack: errorInfo.componentStack,
          },
        });
      }
      // Sentry.captureException(error, { extra: sanitizedError });
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      errorId: null,
      errorTime: null 
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex justify-center">
              <AlertTriangle className="h-16 w-16 text-orange-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900">
                Something went wrong
              </h2>
              <p className="text-gray-600">
                We encountered an unexpected error. This has been logged and our team will investigate.
              </p>
              {this.state.errorId && (
                <p className="text-sm text-gray-500 font-mono">
                  Error ID: {this.state.errorId}
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={this.handleRetry}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Refresh Page
              </Button>
            </div>
            
            <p className="text-xs text-gray-500">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}