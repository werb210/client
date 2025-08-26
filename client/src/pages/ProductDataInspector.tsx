import { usePublicLenders } from '@/hooks/usePublicLenders';

export default function ProductDataInspector() {
  const { data: products, isLoading, error } = usePublicLenders();

  if (isLoading) return <div>Loading products...</div>;
  if (error) return <div>Error: {String(error)}</div>;
  if (!products) return <div>No products loaded</div>;

  console.log('Full product data:', products);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Product Data Inspector</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-800">Summary</h2>
        <p><strong>Total Products:</strong> {products.length}</p>
        <p><strong>Data Type:</strong> {typeof products}</p>
        <p><strong>Is Array:</strong> {Array.isArray(products) ? 'Yes' : 'No'}</p>
      </div>

      {products.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-green-800 mb-3">First Product Structure</h2>
          <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-64">
            {JSON.stringify(products[0], null, 2)}
          </pre>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Product List</h2>
        {products.slice(0, 10).map((product: any, index: number) => (
          <div key={index} className="border rounded-lg p-4 bg-white">
            <h3 className="font-medium text-gray-900">{product.name || 'Unnamed Product'}</h3>
            <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
              <div>
                <strong>Lender:</strong> {product.lender_name || product.lender || 'N/A'}
              </div>
              <div>
                <strong>Category:</strong> {product.category || product.type || 'N/A'}
              </div>
              <div>
                <strong>Country:</strong> {product.country || product.location || 'N/A'}
              </div>
              <div>
                <strong>Active:</strong> {String(product.active ?? 'N/A')}
              </div>
              <div>
                <strong>Min Amount:</strong> ${product.minAmount || product.amountMin || product.amount_min || 'N/A'}
              </div>
              <div>
                <strong>Max Amount:</strong> ${product.maxAmount || product.amountMax || product.amount_max || 'N/A'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}