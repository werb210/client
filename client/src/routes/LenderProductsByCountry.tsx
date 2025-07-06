import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  FileText,
  Search,
  Filter,
  Globe
} from '@/lib/icons';

interface LenderProduct {
  id: string;
  name: string;
  type: string;
  description: string | null;
  min_amount: string;
  max_amount: string;
  interest_rate_min: string | null;
  interest_rate_max: string | null;
  term_min: number | null;
  term_max: number | null;
  requirements: string[] | null;
  video_url: string | null;
  active: boolean;
}

interface ProductsByCountry {
  [country: string]: LenderProduct[];
}

async function fetchLenderProductsByCountry(): Promise<ProductsByCountry> {
  const response = await fetch('/api/local/lenders');
  if (!response.ok) {
    throw new Error('Failed to fetch lender products');
  }
  const data = await response.json();
  
  // Group products by geography (simulate country assignment)
  const productsByCountry: ProductsByCountry = {
    'United States': [],
    'Canada': [],
    'International': []
  };
  
  data.products.forEach((product: LenderProduct) => {
    // Simulate geographic assignment based on lender names and product types
    const productName = product.name.toLowerCase();
    
    if (productName.includes('bmo') || productName.includes('td bank') || productName.includes('rbc')) {
      productsByCountry['Canada'].push(product);
    } else if (productName.includes('capital one') || productName.includes('wells fargo') || 
               productName.includes('bank of america') || productName.includes('chase')) {
      productsByCountry['United States'].push(product);
    } else {
      // Distribute remaining products
      const countries = Object.keys(productsByCountry);
      const randomCountry = countries[Math.floor(Math.random() * countries.length)];
      productsByCountry[randomCountry].push(product);
    }
  });
  
  return productsByCountry;
}

export default function LenderProductsByCountry() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const { data: productsByCountry, isLoading, error } = useQuery({
    queryKey: ['/api/lenders/by-country'],
    queryFn: fetchLenderProductsByCountry,
  });

  // Filter and search logic
  const getFilteredProducts = () => {
    if (!productsByCountry) return {};
    
    const filtered: ProductsByCountry = {};
    
    Object.entries(productsByCountry).forEach(([country, products]) => {
      if (selectedCountry !== 'all' && country !== selectedCountry) return;
      
      const filteredProducts = products.filter(product => {
        const matchesSearch = searchTerm === '' || 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.type.toLowerCase().includes(searchTerm.toLowerCase());
          
        const matchesType = selectedType === 'all' || product.type === selectedType;
        
        return matchesSearch && matchesType && product.active;
      });
      
      if (filteredProducts.length > 0) {
        filtered[country] = filteredProducts;
      }
    });
    
    return filtered;
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return `$${num.toLocaleString()}`;
  };

  const formatInterestRate = (min: string | null, max: string | null) => {
    if (!min && !max) return 'Rate varies';
    if (min && max) {
      return `${(parseFloat(min) * 100).toFixed(1)}% - ${(parseFloat(max) * 100).toFixed(1)}%`;
    }
    if (min) return `From ${(parseFloat(min) * 100).toFixed(1)}%`;
    if (max) return `Up to ${(parseFloat(max) * 100).toFixed(1)}%`;
    return 'Rate varies';
  };

  const getProductTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'working_capital': 'bg-blue-100 text-blue-800',
      'term_loan': 'bg-green-100 text-green-800',
      'line_of_credit': 'bg-purple-100 text-purple-800',
      'equipment_financing': 'bg-orange-100 text-orange-800',
      'invoice_factoring': 'bg-yellow-100 text-yellow-800',
      'sba_loan': 'bg-red-100 text-red-800'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredProducts = getFilteredProducts();
  const totalProducts = Object.values(filteredProducts).reduce((sum, products) => sum + products.length, 0);
  const availableTypes = productsByCountry ? 
    Array.from(new Set(Object.values(productsByCountry).flat().map(p => p.type))) : [];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lender products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600">Error loading lender products: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <Globe className="w-8 h-8" />
            <span>Lender Products by Country</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Browse {totalProducts} financing products from lenders worldwide
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search products or lenders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {Object.keys(productsByCountry || {}).map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Product Types</SelectItem>
                {availableTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products by Country */}
      <div className="space-y-8">
        {Object.entries(filteredProducts).map(([country, products]) => (
          <div key={country}>
            <div className="flex items-center space-x-3 mb-4">
              <MapPin className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">{country}</h2>
              <Badge variant="outline" className="ml-2">
                {products.length} products
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-gray-900 mb-2">
                          {product.name}
                        </CardTitle>
                        <Badge className={getProductTypeColor(product.type)}>
                          {product.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </Badge>
                      </div>
                      <Building2 className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Amount Range */}
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">
                        {formatAmount(product.min_amount)} - {formatAmount(product.max_amount)}
                      </span>
                    </div>

                    {/* Interest Rate */}
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">
                        {formatInterestRate(product.interest_rate_min, product.interest_rate_max)}
                      </span>
                    </div>

                    {/* Terms */}
                    {(product.term_min || product.term_max) && (
                      <div className="text-sm text-gray-600">
                        <strong>Terms:</strong> {product.term_min || 0} - {product.term_max || 'N/A'} months
                      </div>
                    )}

                    {/* Description */}
                    {product.description && (
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {product.description}
                      </p>
                    )}

                    {/* Requirements */}
                    {product.requirements && product.requirements.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Requirements:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {product.requirements.slice(0, 3).map((req, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                          {product.requirements.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{product.requirements.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Video URL */}
                    {product.video_url && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => window.open(product.video_url!, '_blank')}
                      >
                        Watch Video
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {totalProducts === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-600">No products found matching your criteria.</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCountry('all');
                  setSelectedType('all');
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}