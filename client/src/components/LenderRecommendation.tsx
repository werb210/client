import { fetchProducts } from "../../api/products";
import { usePublicLenders } from "@/hooks/usePublicLenders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const LenderRecommendation = () => {
  const { data, error, isLoading } = usePublicLenders();

  if (isLoading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="ml-3">Loading lenders...</p>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-700">Error loading lenders: {error instanceof Error ? error.message : 'Unknown error'}</p>
    </div>
  );

  if (!data || data.length === 0) return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <p className="text-gray-600">No lender products available</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommended Lenders</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{product.lenderName}</CardTitle>
              <p className="text-sm text-gray-600">{product.productName}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{product.productType?.replace('_', ' ') || 'Unknown Type'}</Badge>
                {product.geography.map(geo => (
                  <Badge key={geo} variant="outline">{geo}</Badge>
                ))}
                {product.isActive && (
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                )}
              </div>
              
              <div className="text-sm space-y-1">
                <p><strong>Amount:</strong> ${product.minAmount.toLocaleString()} - ${product.maxAmount.toLocaleString()}</p>
                {product.minRevenue && (
                  <p><strong>Min Revenue:</strong> ${product.minRevenue.toLocaleString()}</p>
                )}
              </div>

              {product.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
              )}

              {product.industries && product.industries.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {product.industries.slice(0, 3).map(industry => (
                    <Badge key={industry} variant="outline" className="text-xs">
                      {industry.replace('_', ' ')}
                    </Badge>
                  ))}
                  {product.industries.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.industries.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1">
                  Learn More
                </Button>
                {product.videoUrl && (
                  <Button size="sm" variant="outline">
                    Watch Video
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};