import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, EditIcon, TrashIcon, SaveIcon, XIcon } from 'lucide-react';
import { BorealLogo } from '@/components/BorealLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface LenderProduct {
  id: number;
  name: string;
  type: string;
  description: string | null;
  min_amount: string | null;
  max_amount: string | null;
  interest_rate_min: string | null;
  interest_rate_max: string | null;
  term_min: number | null;
  term_max: number | null;
  requirements: string[] | null;
  video_url: string | null;
  active: boolean | null;
}

interface ProductFormData {
  name: string;
  type: string;
  description: string;
  min_amount: string;
  max_amount: string;
  interest_rate_min: string;
  interest_rate_max: string;
  term_min: string;
  term_max: string;
  requirements: string;
  video_url: string;
  active: boolean;
}

const PRODUCT_TYPES = [
  'working_capital',
  'term_loan', 
  'line_of_credit',
  'equipment_financing',
  'commercial_real_estate',
  'merchant_cash_advance',
  'invoice_factoring',
  'purchase_order_financing'
];

export default function ProductAdminPage() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    type: '',
    description: '',
    min_amount: '',
    max_amount: '',
    interest_rate_min: '',
    interest_rate_max: '',
    term_min: '',
    term_max: '',
    requirements: '',
    video_url: '',
    active: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['/api/local/lenders'],
    queryFn: async () => {
      const response = await fetch('/api/local/lenders');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      return data.products || [];
    }
  });

  // Create product mutation
  const createProduct = useMutation({
    mutationFn: async (product: Partial<LenderProduct>) => {
      const response = await fetch('/api/admin/lenders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!response.ok) throw new Error('Failed to create product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/local/lenders'] });
      setIsCreating(false);
      resetForm();
      toast({ title: 'Success', description: 'Product created successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create product', variant: 'destructive' });
    }
  });

  // Update product mutation
  const updateProduct = useMutation({
    mutationFn: async ({ id, ...product }: Partial<LenderProduct> & { id: number }) => {
      const response = await fetch(`/api/admin/lenders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!response.ok) throw new Error('Failed to update product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/local/lenders'] });
      setEditingId(null);
      resetForm();
      toast({ title: 'Success', description: 'Product updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update product', variant: 'destructive' });
    }
  });

  // Delete product mutation
  const deleteProduct = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/lenders/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/local/lenders'] });
      toast({ title: 'Success', description: 'Product deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      description: '',
      min_amount: '',
      max_amount: '',
      interest_rate_min: '',
      interest_rate_max: '',
      term_min: '',
      term_max: '',
      requirements: '',
      video_url: '',
      active: true
    });
  };

  const startEdit = (product: LenderProduct) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      type: product.type,
      description: product.description || '',
      min_amount: product.min_amount || '',
      max_amount: product.max_amount || '',
      interest_rate_min: product.interest_rate_min || '',
      interest_rate_max: product.interest_rate_max || '',
      term_min: product.term_min?.toString() || '',
      term_max: product.term_max?.toString() || '',
      requirements: product.requirements?.join(', ') || '',
      video_url: product.video_url || '',
      active: product.active ?? true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      min_amount: formData.min_amount || null,
      max_amount: formData.max_amount || null,
      interest_rate_min: formData.interest_rate_min || null,
      interest_rate_max: formData.interest_rate_max || null,
      term_min: formData.term_min ? parseInt(formData.term_min) : null,
      term_max: formData.term_max ? parseInt(formData.term_max) : null,
      requirements: formData.requirements ? formData.requirements.split(',').map(r => r.trim()) : null,
      video_url: formData.video_url || null
    };

    if (editingId) {
      updateProduct.mutate({ id: editingId, ...productData });
    } else {
      createProduct.mutate(productData);
    }
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(parseFloat(amount));
  };

  const formatProductType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading products</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BorealLogo size="default" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Product Administration</h1>
                <p className="text-sm text-gray-600">Manage lender products and configurations</p>
              </div>
            </div>
            <nav className="flex space-x-6">
              <a href="/portal" className="text-gray-600 hover:text-blue-600 transition-colors">
                Portal
              </a>
              <a href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
                Home
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Lender Products</h2>
            <p className="text-gray-600 mt-1">{products.length} products configured</p>
          </div>
          <Button
            onClick={() => {
              setIsCreating(true);
              resetForm();
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingId) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Product' : 'Create New Product'}</CardTitle>
              <CardDescription>
                {editingId ? 'Update product information' : 'Add a new lender product to the system'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Product Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_TYPES.map(type => (
                          <SelectItem key={type} value={type}>
                            {formatProductType(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min_amount">Minimum Amount</Label>
                    <Input
                      id="min_amount"
                      type="number"
                      step="0.01"
                      value={formData.min_amount}
                      onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_amount">Maximum Amount</Label>
                    <Input
                      id="max_amount"
                      type="number"
                      step="0.01"
                      value={formData.max_amount}
                      onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="interest_rate_min">Min Interest Rate (%)</Label>
                    <Input
                      id="interest_rate_min"
                      type="number"
                      step="0.01"
                      value={formData.interest_rate_min}
                      onChange={(e) => setFormData({ ...formData, interest_rate_min: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="interest_rate_max">Max Interest Rate (%)</Label>
                    <Input
                      id="interest_rate_max"
                      type="number"
                      step="0.01"
                      value={formData.interest_rate_max}
                      onChange={(e) => setFormData({ ...formData, interest_rate_max: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="term_min">Min Term (months)</Label>
                    <Input
                      id="term_min"
                      type="number"
                      value={formData.term_min}
                      onChange={(e) => setFormData({ ...formData, term_min: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="term_max">Max Term (months)</Label>
                    <Input
                      id="term_max"
                      type="number"
                      value={formData.term_max}
                      onChange={(e) => setFormData({ ...formData, term_max: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="requirements">Requirements (comma-separated)</Label>
                  <Input
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="e.g., Bank statements, Tax returns, Financial statements"
                  />
                </div>

                <div>
                  <Label htmlFor="video_url">Video URL</Label>
                  <Input
                    id="video_url"
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="active">Active Product</Label>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreating(false);
                        setEditingId(null);
                        resetForm();
                      }}
                    >
                      <XIcon className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createProduct.isPending || updateProduct.isPending}
                    >
                      <SaveIcon className="w-4 h-4 mr-2" />
                      {editingId ? 'Update' : 'Create'} Product
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Current Products</CardTitle>
            <CardDescription>
              Manage existing lender products and their configurations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Amount Range</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Interest Rate</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product: LenderProduct) => (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-600 truncate max-w-xs">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">
                          {formatProductType(product.type)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatCurrency(product.min_amount)} - {formatCurrency(product.max_amount)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {product.interest_rate_min && product.interest_rate_max
                          ? `${parseFloat(product.interest_rate_min).toFixed(2)}% - ${parseFloat(product.interest_rate_max).toFixed(2)}%`
                          : 'N/A'
                        }
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={product.active ? "default" : "secondary"}>
                          {product.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(product)}
                          >
                            <EditIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this product?')) {
                                deleteProduct.mutate(product.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {products.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No products configured yet.</p>
                  <Button
                    className="mt-4"
                    onClick={() => {
                      setIsCreating(true);
                      resetForm();
                    }}
                  >
                    Create First Product
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}