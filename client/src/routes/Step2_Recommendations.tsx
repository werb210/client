import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFormData } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { useRecommendations } from '@/hooks/useRecommendations';
import { RecommendationCard } from '@/components/recommendations/RecommendationCard';
import { ArrowRight, ArrowLeft, AlertCircle, Loader2, User, MapPin, DollarSign, Building } from 'lucide-react';

export default function Step2Recommendations() {
  const { state, dispatch } = useFormData();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get user's Step 1 data for matching
  const step1Data = state.step1FinancialProfile;
  
  // Convert form data to match useRecommendations interface
  const recommendationData = step1Data ? {
    businessLocation: step1Data.businessLocation as "united-states" | "canada" | undefined,
    industry: step1Data.industry,
    lookingFor: step1Data.lookingFor as "capital" | "equipment" | "both" | undefined,
    fundingAmount: step1Data.fundingAmount,
    useOfFunds: step1Data.useOfFunds,
    lastYearRevenue: step1Data.lastYearRevenue,
    averageMonthlyRevenue: step1Data.monthlyRevenue, // Use monthlyRevenue field
    accountsReceivable: step1Data.accountReceivable, // Use accountReceivable field
    equipmentValue: step1Data.fixedAssets, // Use fixedAssets field
  } : {};
  
  const { categories, isLoading, error } = useRecommendations(recommendationData);

  const totalProducts = Object.values(categories).reduce((t, c) => t + c.count, 0);

  const toTitleCase = (str: string): string => {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  };

  const handleCategorySelect = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
    dispatch({
      type: 'UPDATE_STEP1',
      payload: {
        selectedCategory: categoryKey
      }
    });
  };

  const handleContinue = () => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
    setLocation('/step3-business-details');
  };

  const handleBack = () => {
    setLocation('/application/step-1');
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
          <h1 className="text-3xl font-bold text-gray-900">Product Recommendations</h1>
          <p className="text-gray-600 mt-2">
            Based on your profile, here are financing categories that match your needs
          </p>
          <div className="mt-4">
            <div className="text-sm text-gray-500">Step 2 of 7</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-teal-600 h-2 rounded-full" style={{ width: '28.6%' }}></div>
            </div>
          </div>
        </div>

        {/* Profile Summary */}
        {step1Data && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">Your Profile Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800">
                    {step1Data.businessLocation === 'united-states' ? 'United States' : 'Canada'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800">{step1Data.industry}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800">{step1Data.fundingAmount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800">{step1Data.lookingFor}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {Object.keys(categories).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(categories).map(([key, data]) => (
              <RecommendationCard
                key={key}
                title={toTitleCase(key.replace(/_/g, ' '))}
                percentage={totalProducts > 0 ? Math.round((data.count / totalProducts) * 100) : 0}
                count={data.count}
                score={data.score}
                selected={selectedCategory === key}
                onSelect={() => handleCategorySelect(key)}
                productType={key}
              />
            ))}

            <div className="flex justify-between pt-6">
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Step 1
              </Button>
              <Button 
                onClick={handleContinue}
                className="bg-teal-600 hover:bg-teal-700"
                disabled={!selectedCategory}
              >
                Select a Product to Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Matching Products</h3>
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