import { useState } from 'react';
import { useLenderProducts } from '@/hooks/useLenderProducts';
import { LenderProductSyncStatus } from '@/components/LenderProductSyncStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';

export default function LenderProductSyncDemo() {
  const { data: products, isLoading } = useLenderProducts();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    productType: 'equipment_financing',
    minAmount: '',
    maxAmount: '',
    rate: '',
    country: 'Canada'
  });

  const handleAddProduct = async () => {
    try {
      // This would call the staff app API to add a new product
      console.log('Adding new product:', newProduct);
      
      // Reset form
      setNewProduct({
        name: '',
        description: '',
        productType: 'equipment_financing',
        minAmount: '',
        maxAmount: '',
        rate: '',
        country: 'Canada'
      });
      setShowAddForm(false);
      
      // The useLenderProducts hook will automatically refresh via webhook
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProductTypeBadge = (type: string) => {
    const colors = {
      equipment_financing: 'bg-blue-100 text-blue-800',
      working_capital: 'bg-green-100 text-green-800',
      asset_based_lending: 'bg-purple-100 text-purple-800',
      term_loan: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Real-Time Lender Product Sync</h1>
          <p className="text-gray-600 mt-2">
            WebSocket live synchronization with staff app - single source of truth, zero duplicates
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="default" className="text-xs">
              🔄 Live WebSocket Updates
            </Badge>
          </div>
        </div>
        <LenderProductSyncStatus />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Management Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Manage Products
              <Button 
                size="sm" 
                onClick={() => setShowAddForm(!showAddForm)}
                className="ml-2"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {showAddForm && (
              <div className="border rounded-lg p-4 space-y-3">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Equipment Financing Plus"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="Flexible equipment financing solutions..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="minAmount">Min Amount</Label>
                    <Input
                      id="minAmount"
                      type="number"
                      value={newProduct.minAmount}
                      onChange={(e) => setNewProduct({...newProduct, minAmount: e.target.value})}
                      placeholder="50000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxAmount">Max Amount</Label>
                    <Input
                      id="maxAmount"
                      type="number"
                      value={newProduct.maxAmount}
                      onChange={(e) => setNewProduct({...newProduct, maxAmount: e.target.value})}
                      placeholder="2000000"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="rate">Interest Rate</Label>
                  <Input
                    id="rate"
                    value={newProduct.rate}
                    onChange={(e) => setNewProduct({...newProduct, rate: e.target.value})}
                    placeholder="Prime + 2.5%"
                  />
                </div>
                
                <Button onClick={handleAddProduct} className="w-full">
                  Add Product
                </Button>
              </div>
            )}
            
            <div className="text-sm text-gray-600">
              <h4 className="font-medium mb-2">Sync Features:</h4>
              <ul className="space-y-1">
                <li>✅ Real-time updates via webhooks</li>
                <li>✅ Automatic cache invalidation</li>
                <li>✅ Single source of truth (Staff App)</li>
                <li>✅ No duplicate products</li>
                <li>✅ Offline resilience</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Products List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Live Lender Products ({products?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border rounded-lg p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="space-y-4">
                {products.map((product: any, index: number) => (
                  <div 
                    key={product.id || index}
                    className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                      selectedProduct?.id === product.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          {getProductTypeBadge(product.productType)}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                            <span>
                              {formatCurrency(product.minAmount)} - {formatCurrency(product.maxAmount)}
                            </span>
                          </div>
                          
                          <Badge variant="outline" className="text-xs">
                            {product.rate}
                          </Badge>
                          
                          <Badge variant="secondary" className="text-xs">
                            {product.country}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No lender products found.</p>
                <p className="text-sm mt-1">Add products from the staff app to see them here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Product Details */}
      {selectedProduct && (
        <Card>
          <CardHeader>
            <CardTitle>Product Details: {selectedProduct.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <Label className="font-medium">Product Information</Label>
                <div className="mt-2 space-y-2 text-sm">
                  <div><strong>ID:</strong> {selectedProduct.id}</div>
                  <div><strong>Type:</strong> {selectedProduct.productType}</div>
                  <div><strong>Country:</strong> {selectedProduct.country}</div>
                  <div><strong>Lender:</strong> {selectedProduct.lenderId}</div>
                </div>
              </div>
              
              <div>
                <Label className="font-medium">Financial Details</Label>
                <div className="mt-2 space-y-2 text-sm">
                  <div><strong>Min Amount:</strong> {formatCurrency(selectedProduct.minAmount)}</div>
                  <div><strong>Max Amount:</strong> {formatCurrency(selectedProduct.maxAmount)}</div>
                  <div><strong>Interest Rate:</strong> {selectedProduct.rate}</div>
                </div>
              </div>
              
              <div>
                <Label className="font-medium">Timestamps</Label>
                <div className="mt-2 space-y-2 text-sm">
                  <div><strong>Created:</strong> {selectedProduct.createdAt ? new Date(selectedProduct.createdAt).toLocaleString() : 'N/A'}</div>
                  <div><strong>Updated:</strong> {selectedProduct.updatedAt ? new Date(selectedProduct.updatedAt).toLocaleString() : 'N/A'}</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Label className="font-medium">Description</Label>
              <p className="mt-2 text-sm text-gray-700">{selectedProduct.description}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}