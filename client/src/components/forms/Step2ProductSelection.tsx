import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Play, Loader2, AlertCircle } from 'lucide-react';
import { usePublicLenders } from '@/hooks/usePublicLenders';
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
import { useComprehensiveForm } from '@/context/ComprehensiveFormContext';

interface Step2Props {
  onNext: () => void;
  onPrevious: () => void;
}

export function Step2ProductSelection({ onNext, onPrevious }: Step2Props) {
  const { state, updateFormData } = useComprehensiveForm();
  const { data: products, isLoading, error } = usePublicLenders();
  
  const handleProductSelect = (product: LenderProduct) => {
    updateFormData({
      selectedProductId: product.id,
      selectedProductName: product.product_name,
      selectedLenderName: product.lender_name,
      matchScore: scoredProducts.find(p => p.id === product.id)?.score
    });
    onNext();
  };

  // Map form "lookingFor" values to product types
  const mapLookingForToProductTypes = (lookingFor: string): string[] => {
    const mapping = {
      'capital': ['working_capital', 'line_of_credit', 'term_loan', 'invoice_factoring'],
      'equipment': ['equipment_financing'],
      'both': ['working_capital', 'line_of_credit', 'term_loan', 'equipment_financing', 'invoice_factoring', 'purchase_order_financing']
    };
    return mapping[lookingFor as keyof typeof mapping] || [];
  };

  // Filter and score products based on Step 1 data
  const getFilteredAndScoredProducts = (): Array<LenderProduct & { score: number }> => {
    if (!products || !state.formData.headquarters || !state.formData.lookingFor || !state.formData.fundingAmount) {
      return [];
    }

    const headquarters = state.formData.headquarters;
    const lookingFor = state.formData.lookingFor;
    const fundingAmount = Number(state.formData.fundingAmount);
    const averageMonthlyRevenue = Number(state.formData.averageMonthlyRevenue) || 0;
    const annualRevenue = averageMonthlyRevenue * 12;
    const industry = state.formData.industry;
    const allowedProductTypes = mapLookingForToProductTypes(lookingFor);

    return products
      .map(product => {
        let score = 0;

        // Geography filter - must match to be included
        if (!product.geography.includes(headquarters)) {
          return null;
        }

        // Product type filter - must match to be included  
        if (!allowedProductTypes.includes(product.product_type)) {
          return null;
        }

        // Amount fit - must be within range to be included
        if (fundingAmount < product.min_amount || fundingAmount > product.max_amount) {
          return null;
        }

        // Revenue requirement check - must meet minimum if specified
        if (product.min_revenue && annualRevenue < product.min_revenue) {
          return null;
        }

        // Base score for matching all requirements
        score = 60;

        // Amount range bonus (closer to middle of range = higher score)
        const amountRange = product.max_amount - product.min_amount;
        const amountPosition = (fundingAmount - product.min_amount) / amountRange;
        const amountScore = 30 * (1 - Math.abs(amountPosition - 0.5) * 2); // Higher score for middle of range
        score += amountScore;

        // Industry match bonus
        if (industry && product.industries?.includes(industry)) {
          score += 10;
        }

        return { ...product, score: Math.round(score) };
      })
      .filter((product): product is LenderProduct & { score: number } => product !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Top 3 matches
  };

  const scoredProducts = getFilteredAndScoredProducts();

  const getProductTypeLabel = (type: string) => {
    const labels = {
      'equipment_financing': 'Equipment Financing',
      'invoice_factoring': 'Invoice Factoring', 
      'line_of_credit': 'Line of Credit',
      'working_capital': 'Working Capital',
      'term_loan': 'Term Loan',
      'purchase_order_financing': 'Purchase Order Financing'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Finding Your Perfect Match</h2>
          <p className="text-slate-600">Analyzing lending products based on your business profile...</p>
        </div>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <span className="ml-2 text-slate-600">Loading recommendations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Recommendations</h2>
          <p className="text-slate-600">We're having trouble loading product recommendations right now.</p>
        </div>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-orange-800 mb-2">Service Temporarily Unavailable</h3>
            <p className="text-orange-700 mb-4">
              Unable to fetch lending products. Please continue with your application and we'll match you with suitable lenders manually.
            </p>
            <Button onClick={onNext} className="bg-teal-600 hover:bg-teal-700">
              Continue Application
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Recommended Financing Solutions</h2>
        <p className="text-slate-600">
          Based on your business profile, here are the top matches from our lending partners
        </p>
      </div>

      {scoredProducts.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Direct Matches Found</h3>
            <p className="text-slate-600 mb-4">
              We don't have products that exactly match your criteria, but our team can help find alternative solutions.
            </p>
            <Button onClick={onNext} className="bg-teal-600 hover:bg-teal-700">
              Continue Application
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {scoredProducts.map((product) => (
            <Card key={product.id} className="border-2 hover:border-teal-200 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-slate-900">{product.product_name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-600">{product.lender_name}</span>
                      <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                        {Math.round((product.score / 100) * 100)}% Match
                      </Badge>
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {getProductTypeLabel(product.product_type)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-slate-700">Funding Range:</span>
                    <div className="text-slate-600">
                      {formatCurrency(product.min_amount)} - {formatCurrency(product.max_amount)}
                    </div>
                  </div>
                  {product.min_revenue && (
                    <div>
                      <span className="font-medium text-slate-700">Min. Annual Revenue:</span>
                      <div className="text-slate-600">{formatCurrency(product.min_revenue)}</div>
                    </div>
                  )}
                  {product.industries && product.industries.length > 0 && (
                    <div className="md:col-span-2">
                      <span className="font-medium text-slate-700">Industries Served:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.industries.map((industry, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {industry}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {product.description && (
                  <div>
                    <p className="text-slate-700 text-sm leading-relaxed">{product.description}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    onClick={() => handleProductSelect(product)}
                    className="bg-teal-600 hover:bg-teal-700 flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Select This Product
                  </Button>
                  {product.video_url && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(product.video_url, '_blank')}
                      className="flex-shrink-0"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Watch Explainer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="outline" onClick={onPrevious} className="flex-1">
              Previous Step
            </Button>
            <Button onClick={onNext} variant="outline" className="flex-1">
              Skip Product Selection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}