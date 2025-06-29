import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFormData } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { usePublicLenders } from '@/hooks/usePublicLenders';
import { ArrowRight, ArrowLeft, Play, Star, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';

interface LenderProduct {
  id: string;
  product_name: string;
  lender_name: string;
  product_type: string;
  geography: string[];
  min_amount: number;
  max_amount: number;
  min_revenue?: number;
  industries?: string[];
  video_url?: string;
  description?: string;
}

interface ProductRecommendation extends LenderProduct {
  matchScore: number;
  matchReasons: string[];
}

export default function Step2Recommendations() {
  const { state, dispatch } = useFormData();
  const [, setLocation] = useLocation();
  const { data: lenderProducts, isLoading, error } = usePublicLenders();
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);

  // Get user's Step 1 data for matching
  const step1Data = state.step1FinancialProfile;

  useEffect(() => {
    if (lenderProducts && step1Data) {
      const matchedProducts = generateRecommendations(lenderProducts, step1Data);
      setRecommendations(matchedProducts);
    }
  }, [lenderProducts, step1Data]);

  const generateRecommendations = (products: LenderProduct[], formData: any): ProductRecommendation[] => {
    if (!products || !formData) return [];

    const recommendations = products.map(product => {
      let score = 60; // Base score
      const reasons: string[] = [];

      // Geography matching
      const userLocation = formData.businessLocation;
      if (userLocation === 'united-states' && product.geography.includes('US')) {
        score += 20;
        reasons.push('Available in United States');
      } else if (userLocation === 'canada' && product.geography.includes('CA')) {
        score += 20;
        reasons.push('Available in Canada');
      }

      // Product type matching based on "looking for"
      const lookingFor = formData.lookingFor;
      if (lookingFor === 'capital' && ['working_capital', 'line_of_credit', 'term_loan'].includes(product.product_type)) {
        score += 15;
        reasons.push('Matches capital needs');
      } else if (lookingFor === 'equipment' && product.product_type === 'equipment_financing') {
        score += 20;
        reasons.push('Perfect for equipment financing');
      } else if (lookingFor === 'both') {
        score += 10;
        reasons.push('Flexible financing option');
      }

      // Amount range matching
      const fundingAmount = parseFloat(formData.fundingAmount?.replace(/[^0-9.-]+/g, '') || '0');
      if (fundingAmount >= product.min_amount && fundingAmount <= product.max_amount) {
        score += 15;
        reasons.push(`Covers your ${formatCurrency(fundingAmount)} funding need`);
      }

      // Industry matching
      const userIndustry = formData.industry;
      if (product.industries && product.industries.includes(userIndustry)) {
        score += 10;
        reasons.push(`Specializes in ${userIndustry} industry`);
      }

      // Revenue requirements
      const lastYearRevenue = getRevenueValue(formData.lastYearRevenue);
      if (product.min_revenue && lastYearRevenue >= product.min_revenue) {
        score += 5;
        reasons.push('Meets revenue requirements');
      }

      return {
        ...product,
        matchScore: Math.min(score, 100),
        matchReasons: reasons
      };
    });

    // Sort by match score and return top 3
    return recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);
  };

  const getRevenueValue = (revenueRange: string): number => {
    const ranges: { [key: string]: number } = {
      'under-100k': 50000,
      '100k-to-250k': 175000,
      '250k-to-500k': 375000,
      '500k-to-1m': 750000,
      '1m-to-5m': 3000000,
      'over-5m': 7500000
    };
    return ranges[revenueRange] || 0;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getScoreColor = (score: number): string => {
    if (score >= 85) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
    const product = recommendations.find(p => p.id === productId);
    if (product) {
      dispatch({
        type: 'UPDATE_STEP1',
        payload: {
          ...step1Data,
          selectedProduct: productId,
          selectedProductName: product.product_name,
          selectedLenderName: product.lender_name
        }
      });
    }
  };

  const handleContinue = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
    setLocation('/step3-business-details');
  };

  const handleBack = () => {
    setLocation('/application/step-1');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" />
            <p className="mt-4 text-gray-600">Loading personalized recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="border-red-200">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Connection Error</h3>
              <p className="text-red-600 mb-4">Unable to load lender products from the database.</p>
              <div className="space-x-4">
                <Button onClick={handleBack} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Step 1
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Retry Loading
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Personalized Recommendations</h1>
          <p className="text-gray-600 mt-2">
            Based on your profile, here are the top financing options from our lender network
          </p>
          <div className="mt-4">
            <div className="text-sm text-gray-500">Step 2 of 7</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-teal-600 h-2 rounded-full" style={{ width: '28.6%' }}></div>
            </div>
          </div>
        </div>

        {recommendations.length > 0 ? (
          <div className="space-y-6">
            {recommendations.map((product, index) => (
              <Card 
                key={product.id} 
                className={`cursor-pointer transition-all duration-200 ${
                  selectedProduct === product.id 
                    ? 'ring-2 ring-teal-500 shadow-lg' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleProductSelect(product.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {index === 0 && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Best Match
                          </Badge>
                        )}
                        <Badge className={getScoreColor(product.matchScore)}>
                          {product.matchScore}% Match
                        </Badge>
                      </div>
                      <CardTitle className="text-xl text-gray-900">
                        {product.product_name}
                      </CardTitle>
                      <p className="text-gray-600 font-medium">{product.lender_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Amount Range</p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(product.min_amount)} - {formatCurrency(product.max_amount)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {product.description && (
                    <p className="text-gray-700 mb-4">{product.description}</p>
                  )}
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Why this matches your needs:</h4>
                    <ul className="space-y-1">
                      {product.matchReasons.map((reason, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center">
                          <TrendingUp className="w-3 h-3 mr-2 text-teal-600" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">
                        {product.product_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Available in: {product.geography.join(', ')}
                      </span>
                    </div>
                    {product.video_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(product.video_url, '_blank');
                        }}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Watch Video
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-between pt-6">
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Step 1
              </Button>
              <Button 
                onClick={handleContinue}
                className="bg-teal-600 hover:bg-teal-700"
                disabled={!selectedProduct}
              >
                Continue to Business Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Products Available</h3>
              <p className="text-gray-600 mb-4">
                No lender products were found that match your current criteria.
              </p>
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Update Criteria
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}