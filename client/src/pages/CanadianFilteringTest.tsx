import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CanadianFilteringTest() {
  const [rawData, setRawData] = useState<any>(null);
  const [normalizedData, setNormalizedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [canadianProducts, setCanadianProducts] = useState<any[]>([]);

  const fetchRawData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/public/lenders`);
      const data = await response.json();
      setRawData(data);
      console.log('Raw API Data:', data);
      
      // Check for any geography information in raw data
      const hasGeography = data.products?.some((p: any) => p.geography?.length > 0);
      console.log('Raw data has geography?', hasGeography);
      
    } catch (error) {
      console.error('Error fetching raw data:', error);
    }
    setLoading(false);
  };

  const fetchNormalizedData = async () => {
    setLoading(true);
    try {
      // Import the normalized fetch function
      const { fetchLenderProducts } = await import('@/api/lenderProducts');
      const normalized = await fetchLenderProducts();
      setNormalizedData(normalized);
      console.log('Normalized Data:', normalized);
      
      // Filter Canadian products
      const canadianFiltered = normalized.filter((p: any) => 
        p.geography?.includes('CA')
      );
      setCanadianProducts(canadianFiltered);
      
      console.log('Canadian Products Found:', canadianFiltered.length);
      console.log('Canadian Products:', canadianFiltered);
      
    } catch (error) {
      console.error('Error fetching normalized data:', error);
    }
    setLoading(false);
  };

  const testStep2Logic = () => {
    console.log('=== TESTING STEP 2 LOGIC ===');
    
    if (!normalizedData) {
      console.log('No normalized data available');
      return;
    }

    // Simulate Canadian business scenario
    const testFormData = {
      businessLocation: "canada",
      lookingFor: "capital",
      fundingAmount: "$40,000",
      accountsReceivable: "Less than $5,000"
    };

    console.log('Test Form Data:', testFormData);
    
    // Filter logic similar to useRecommendations
    const targetCountry = "CA";
    const fundingAmount = 40000;
    
    const matches = normalizedData.filter((p: any) => {
      // Geography check
      if (!p.geography?.includes(targetCountry)) {
        return false;
      }
      
      // Amount check  
      if (fundingAmount < p.minAmount || fundingAmount > p.maxAmount) {
        return false;
      }
      
      return true;
    });

    console.log(`Found ${matches.length} matches for Canadian business`);
    console.log('Matching Products:', matches.map((p: any) => ({
      name: p.name,
      lenderName: p.lenderName,
      geography: p.geography,
      minAmount: p.minAmount,
      maxAmount: p.maxAmount,
      category: p.category
    })));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Canadian Product Filtering Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button onClick={fetchRawData} disabled={loading}>
          Fetch Raw API Data
        </Button>
        <Button onClick={fetchNormalizedData} disabled={loading}>
          Fetch Normalized Data
        </Button>
        <Button onClick={testStep2Logic} disabled={!normalizedData}>
          Test Step 2 Logic
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Raw Data Card */}
        <Card>
          <CardHeader>
            <CardTitle>Raw API Data</CardTitle>
          </CardHeader>
          <CardContent>
            {rawData ? (
              <div className="space-y-2">
                <p><strong>Total Products:</strong> {rawData.products?.length || 0}</p>
                <p><strong>Has Geography Field:</strong> {
                  rawData.products?.some((p: any) => p.geography?.length > 0) ? 'Yes' : 'No'
                }</p>
                <div className="max-h-40 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
                  <pre>{JSON.stringify(rawData.products?.[0], null, 2)}</pre>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Click "Fetch Raw API Data" to load</p>
            )}
          </CardContent>
        </Card>

        {/* Normalized Data Card */}
        <Card>
          <CardHeader>
            <CardTitle>Normalized Data</CardTitle>
          </CardHeader>
          <CardContent>
            {normalizedData ? (
              <div className="space-y-2">
                <p><strong>Total Products:</strong> {normalizedData.length}</p>
                <p><strong>Canadian Products:</strong> {canadianProducts.length}</p>
                <p><strong>US Products:</strong> {
                  normalizedData.filter((p: any) => p.geography?.includes('US')).length
                }</p>
                <div className="max-h-40 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
                  <pre>{JSON.stringify(normalizedData[0], null, 2)}</pre>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Click "Fetch Normalized Data" to load</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Canadian Products List */}
      {canadianProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Canadian Products ({canadianProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {canadianProducts.map((product, index) => (
                <div key={index} className="p-2 bg-blue-50 rounded border">
                  <p><strong>{product.name}</strong> by {product.lenderName}</p>
                  <p className="text-sm text-gray-600">
                    Geography: {product.geography?.join(', ')} | 
                    Range: ${product.minAmount?.toLocaleString()} - ${product.maxAmount?.toLocaleString()} |
                    Category: {product.category}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded">
        <p><strong>Test Instructions:</strong></p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click "Fetch Raw API Data" to see the original staff API response</li>
          <li>Click "Fetch Normalized Data" to see products with geography assignments</li>
          <li>Verify Canadian products appear in the list</li>
          <li>Click "Test Step 2 Logic" to simulate Canadian business filtering</li>
          <li>Check browser console for detailed logging</li>
        </ol>
      </div>
    </div>
  );
}