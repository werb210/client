import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Building2, DollarSign, Target, CheckCircle, AlertCircle } from 'lucide-react';

interface RecommendationEngineProps {
  formData: {
    headquarters?: 'US' | 'CA';
    lookingFor?: 'capital' | 'equipment' | 'both';
    fundsPurpose?: string;
    fundingAmount?: number;
    accountsReceivableBalance?: number;
  };
}

interface ProductCategory {
  category: string;
  count: number;
  percentage: number;
  matchScore: number;
}

interface IndustryInsights {
  totalProducts: number;
  totalLenders: number;
  categories: ProductCategory[];
  averageAmountRange: {
    min: number;
    max: number;
  };
  topRecommendations: ProductCategory[];
  insights: string[];
}

export function RecommendationEngine({ formData }: RecommendationEngineProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (formData.headquarters) queryParams.append('country', formData.headquarters);
  if (formData.lookingFor) queryParams.append('lookingFor', formData.lookingFor);
  if (formData.fundsPurpose) queryParams.append('fundsPurpose', formData.fundsPurpose);
  if (formData.fundingAmount) queryParams.append('fundingAmount', formData.fundingAmount.toString());
  if (formData.accountsReceivableBalance) queryParams.append('accountsReceivableBalance', formData.accountsReceivableBalance.toString());

  // Fetch industry insights
  const { data: insights, isLoading, error } = useQuery({
    queryKey: ['/api/recommendations/insights', queryParams.toString()],
    queryFn: async (): Promise<IndustryInsights> => {
      const response = await fetch(`/api/recommendations/insights?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch insights');
      return response.json();
    },
    enabled: !!(formData.headquarters && formData.lookingFor),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });

  // Show component when we have basic required data
  useEffect(() => {
    if (formData.headquarters && formData.lookingFor) {
      setIsVisible(true);
    }
  }, [formData.headquarters, formData.lookingFor]);

  if (!isVisible) return null;

  if (error) {
    return (
      <Card className="mt-6 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center text-red-700">
            <AlertCircle className="mr-2 h-5 w-5" />
            Insights Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Unable to load market insights. Using local database for recommendations.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-teal-600" />
            Industry Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  return (
    <Card className="mt-6 border-teal-200 bg-gradient-to-br from-teal-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-teal-600" />
            Industry Insights
          </div>
          <Badge variant="secondary" className="bg-teal-100 text-teal-800">
            {formData.headquarters === 'US' ? 'United States' : 'Canada'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Real-time analysis based on your business profile
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium">Available Products</span>
            </div>
            <Badge variant="default" className="bg-green-600">
              {insights.totalProducts}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium">Active Lenders</span>
            </div>
            <Badge variant="default" className="bg-blue-600">
              {insights.totalLenders}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center">
              <Target className="h-5 w-5 text-purple-600 mr-2" />
              <span className="font-medium">Avg Range</span>
            </div>
            <Badge variant="outline" className="text-xs">
              ${(insights.averageAmountRange.min / 1000).toFixed(0)}K - ${(insights.averageAmountRange.max / 1000).toFixed(0)}K
            </Badge>
          </div>
        </div>

        {/* Top Recommendations */}
        {insights.topRecommendations && insights.topRecommendations.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-teal-600" />
              Top Recommendations
            </h4>
            <div className="space-y-3">
              {insights.topRecommendations.slice(0, 3).map((category, index) => (
                <div key={index} className="bg-white rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-purple-500'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{category.category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {category.count} products
                      </Badge>
                      <Badge className={`${
                        category.matchScore >= 90 ? 'bg-green-600' :
                        category.matchScore >= 75 ? 'bg-blue-600' : 'bg-purple-600'
                      } text-white`}>
                        {category.matchScore}% match
                      </Badge>
                    </div>
                  </div>
                  <Progress value={category.matchScore} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Categories Breakdown */}
        {insights.categories && insights.categories.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-teal-600" />
              Product Categories Available
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {insights.categories.slice(0, 6).map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <span className="font-medium text-gray-900">{category.category}</span>
                    <div className="text-xs text-gray-500">{category.count} products available</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs mb-1">
                      {category.percentage}%
                    </Badge>
                    <div className="text-xs text-gray-500">
                      {category.matchScore}% match
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Industry Insights */}
        {insights.insights && insights.insights.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-teal-600" />
              Key Insights
            </h4>
            <div className="space-y-2">
              {insights.insights.map((insight, index) => (
                <div key={index} className="flex items-start space-x-2 p-3 bg-white rounded-lg border">
                  <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-700">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Prompt */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg p-4">
          <h4 className="font-semibold mb-2">Ready to Apply?</h4>
          <p className="text-sm text-teal-100">
            Based on your profile, you have access to {insights.totalProducts} products from {insights.totalLenders} lenders. 
            Continue to get personalized recommendations and competitive offers.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}