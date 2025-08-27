import React from 'react';
import { logger } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class GlobalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('🚨 Global Error Boundary caught an error:', error);
    logger.error('Error Info:', errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // In development, provide more debugging info
    if (import.meta.env.DEV) {
      logger.error('[DEV] Component Stack:', errorInfo.componentStack);
      logger.error('[DEV] Error Stack:', error.stack);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <div className="max-w-md w-full">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Something went wrong</AlertTitle>
              <AlertDescription className="text-red-700 mt-2">
                The application encountered an unexpected error. Please try refreshing the page.
              </AlertDescription>
            </Alert>
            
            <div className="mt-4 space-y-2">
              <Button 
                onClick={this.handleRetry}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                onClick={() => window.location.reload()}
                className="w-full"
                variant="default"
              >
                Refresh Page
              </Button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="mt-4 p-3 bg-red-100 rounded border text-sm">
                <summary className="cursor-pointer font-medium text-red-800">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-red-700 whitespace-pre-wrap">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}