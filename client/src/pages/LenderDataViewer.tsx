import { useState, useEffect } from 'react';
import { fetchProducts } from "../api/products";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Database from 'lucide-react/dist/esm/icons/database';
import Globe from 'lucide-react/dist/esm/icons/globe';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Building2 from 'lucide-react/dist/esm/icons/building-2';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import { usePublicLenders } from '@/hooks/usePublicLenders';

interface RawApiData {
  products: any[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function LenderDataViewer() {
  const [localData, setLocalData] = useState<RawApiData | null>(null);
  const [staffData, setStaffData] = useState<RawApiData | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [staffError, setStaffError] = useState<string | null>(null);

  // Also use the hook for normalized data
  const { data: normalizedData, isLoading: normalizedLoading, error: normalizedError } = usePublicLenders();

  const fetchLocalData = async () => { /* ensure products fetched */ 
    setLocalLoading(true);
    setLocalError('Local lenders API has been removed - using staff backend only');
    setLocalLoading(false);
  };

  const fetchStaffData = async () => {
    setStaffLoading(true);
    setStaffError(null);
    try {
      const response = await /* rewired */
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setStaffData(data);
    } catch (error) {
      setStaffError(error instanceof Error ? error.message : 'Failed to fetch staff data');
    } finally {
      setStaffLoading(false);
    }
  };

  useEffect(() => {
    fetchLocalData();
    fetchStaffData();
  }, []);

  const renderProductCard = (product: any, source: string) => {
    // Handle different API response formats
    const name = product.productName || product.product_name || 'Unknown Product';
    const lender = product.lenderName || product.lender_name || 'Unknown Lender';
    const type = product.productType || product.product_type || 'Unknown Type';
    const minAmount = product.minAmount || product.min_amount || 0;
    const maxAmount = product.maxAmount || product.max_amount || 0;
    const geography = product.geography || [];
    const description = product.description || 'No description available';

    const products = await fetchProducts();
return (
      <Card key={`${source}-${product.id}`} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription className="font-medium text-teal-700">{lender}</CardDescription>
            </div>
            <Badge variant="outline" className="ml-2">{source}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Type:</span> {type}
            </div>
            <div>
              <span className="font-medium">Geography:</span> {Array.isArray(geography) ? geography.join(', ') : geography}
            </div>
            <div>
              <span className="font-medium">Amount Range:</span> {formatCurrency(minAmount)} - {formatCurrency(maxAmount)}
            </div>
            <div>
              <span className="font-medium">ID:</span> {product.id}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Description:</span> {description}
          </div>
        </CardContent>
      </Card>
    );
  };

  const DataSection = ({ 
    title, 
    data, 
    loading, 
    error, 
    onRefresh,
    icon: Icon,
    source 
  }: {
    title: string;
    data: RawApiData | null;
    loading: boolean;
    error: string | null;
    onRefresh: () => void;
    icon: any;
    source: string;
  }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-teal-600" />
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <Button onClick={onRefresh} disabled={loading} size="sm" variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading {source} data...</span>
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700 font-medium">Error loading {source} data</p>
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {data && !loading && !error && (
        <div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-teal-600">{data.total}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{data.products.length}</div>
                <div className="text-sm text-gray-600">Returned</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{data.page || 1}</div>
                <div className="text-sm text-gray-600">Page</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{data.totalPages || 1}</div>
                <div className="text-sm text-gray-600">Total Pages</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {data.products.map((product, index) => renderProductCard(product, source))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Lender Product API Data Viewer
        </h1>
        <p className="text-gray-600">
          Real-time data from both local development and production APIs
        </p>
      </div>

      <Tabs defaultValue="local" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="local">Local API (Development)</TabsTrigger>
          <TabsTrigger value="staff">Staff API (Production)</TabsTrigger>
          <TabsTrigger value="normalized">Normalized Data (Hook)</TabsTrigger>
        </TabsList>

        <TabsContent value="local">
          <DataSection
            title="Local Development API"
            data={localData}
            loading={localLoading}
            error={localError}
            onRefresh={fetchLocalData}
            icon={Database}
            source="Local"
          />
        </TabsContent>

        <TabsContent value="staff">
          <DataSection
            title="Staff Production API"
            data={staffData}
            loading={staffLoading}
            error={staffError}
            onRefresh={fetchStaffData}
            icon={Globe}
            source="Staff"
          />
        </TabsContent>

        <TabsContent value="normalized">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-teal-600" />
              <h2 className="text-xl font-semibold">Normalized Data (TanStack Query Hook)</h2>
            </div>

            {normalizedLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading normalized data...</span>
              </div>
            )}

            {normalizedError && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <p className="text-red-700 font-medium">Error loading normalized data</p>
                  <p className="text-red-600 text-sm">{String(normalizedError)}</p>
                </CardContent>
              </Card>
            )}

            {normalizedData && !normalizedLoading && !normalizedError && (
              <div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-teal-600">{normalizedData.length}</div>
                      <div className="text-sm text-gray-600">Products</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {new Set(normalizedData.map(p => p.productType)).size}
                      </div>
                      <div className="text-sm text-gray-600">Product Types</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {new Set(normalizedData.map(p => p.lenderName)).size}
                      </div>
                      <div className="text-sm text-gray-600">Lenders</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  {normalizedData.map((product, index) => renderProductCard(product, 'Normalized'))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}