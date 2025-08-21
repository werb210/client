import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';

/**
 * Staff API Connectivity Test
 * Tests connections to applications, lender products, and documents endpoints
 */
export default function StaffApiConnectivityTest() {
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  // Test Applications API
  const { data: applications, isLoading: appsLoading, error: appsError, refetch: refetchApps } = useQuery({
    queryKey: ['/api/applications'],
    staleTime: 0,
    retry: 2,
    retryDelay: 1000,
  });

  // Test Lender Products API
  const { data: lenderProducts, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useQuery({
    queryKey: ['/api/lender-products'],
    staleTime: 0,
    retry: 2,
    retryDelay: 1000,
  });

  // Test Documents API
  const { data: documents, isLoading: docsLoading, error: docsError, refetch: refetchDocs } = useQuery({
    queryKey: ['/api/documents'],
    staleTime: 0,
    retry: 2,
    retryDelay: 1000,
  });

  // Test Lenders API
  const { data: lenders, isLoading: lendersLoading, error: lendersError, refetch: refetchLenders } = useQuery({
    queryKey: ['/api/lenders'],
    staleTime: 0,
    retry: 2,
    retryDelay: 1000,
  });

  const refreshAll = () => {
    refetchApps();
    refetchProducts();
    refetchDocs();
    refetchLenders();
  };

  const getStatusBadge = (isLoading: boolean, error: any, data: any): JSX.Element => {
    if (isLoading) {
      return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Loading</Badge>;
    }
    if (error) {
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>;
    }
    if (data) {
      return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
    }
    return <Badge variant="outline">No Data</Badge>;
  };

  const formatResponse = (data: any, error: any) => {
    if (error) {
      return {
        status: 'error',
        message: error.message,
        details: error.toString()
      };
    }
    if (Array.isArray(data)) {
      return {
        status: 'success',
        count: data.length,
        sample: data.slice(0, 3),
        total: data.length
      };
    }
    return {
      status: 'success',
      data: data,
      type: typeof data
    };
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff API Connectivity Test</h1>
          <p className="text-muted-foreground mt-2">
            Testing connections to Staff backend APIs for applications, lender products, and documents
          </p>
        </div>
        <Button onClick={refreshAll} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh All
        </Button>
      </div>

      {/* API Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Applications API</CardTitle>
          </CardHeader>
          <CardContent>
            {getStatusBadge(appsLoading, appsError, applications)}
            {applications && Array.isArray(applications) && (
              <p className="text-xs text-muted-foreground mt-1">
                {(applications as any[]).length} items
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Lender Products API</CardTitle>
          </CardHeader>
          <CardContent>
            {getStatusBadge(productsLoading, productsError, lenderProducts)}
            {lenderProducts && Array.isArray(lenderProducts) && (
              <p className="text-xs text-muted-foreground mt-1">
                {(lenderProducts as any[]).length} items
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Documents API</CardTitle>
          </CardHeader>
          <CardContent>
            {getStatusBadge(docsLoading, docsError, documents)}
            {documents && Array.isArray(documents) && (
              <p className="text-xs text-muted-foreground mt-1">
                {(documents as any[]).length} items
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Lenders API</CardTitle>
          </CardHeader>
          <CardContent>
            {getStatusBadge(lendersLoading, lendersError, lenders)}
            {lenders && Array.isArray(lenders) && (
              <p className="text-xs text-muted-foreground mt-1">
                {(lenders as any[]).length} items
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed API Responses */}
      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="products">Lender Products</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="lenders">Lenders</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Applications API Response
                {getStatusBadge(appsLoading, appsError, applications)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                {JSON.stringify(formatResponse(applications, appsError), null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Lender Products API Response
                {getStatusBadge(productsLoading, productsError, lenderProducts)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                {JSON.stringify(formatResponse(lenderProducts, productsError), null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Documents API Response
                {getStatusBadge(docsLoading, docsError, documents)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                {JSON.stringify(formatResponse(documents, docsError), null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lenders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Lenders API Response
                {getStatusBadge(lendersLoading, lendersError, lenders)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                {JSON.stringify(formatResponse(lenders, lendersError), null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Environment Information */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'Not configured'}
            </div>
            <div>
              <strong>Environment:</strong> {import.meta.env.MODE}
            </div>
            <div>
              <strong>Development Mode:</strong> {import.meta.env.DEV ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Staff API URL (Runtime):</strong> {window.location.origin}/api
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}