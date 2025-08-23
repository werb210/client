import { useState, useEffect } from 'react';
import { logger } from '@/lib/utils';
import { useFormData } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { StepHeader } from '@/components/StepHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLenderProducts, useProductCategories } from '@/hooks/useLenderProducts';

export default function Step2Recommendations() {
  const { state, dispatch } = useFormData();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Load products and categories from local sync
  const products = useLenderProducts();
  const categories = useProductCategories();

  // ✅ GA TEST EVENT - Fire on page load
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'ga_test_event', {
        step: 'step_2_recommendations_loaded',
        source: 'local_sync',
        verified: true,
        productsCount: products.length,
        categoriesCount: categories.length,
      });
      console.log('✅ GA test event fired for recommendations page');
    }
  }, [products.length, categories.length]);

  // Continue to next step with selected category
  const handleContinue = () => {
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        step2: {
          selectedCategory,
          availableProducts: products.filter((p: any) => 
            !selectedCategory || 
            p.category === selectedCategory || 
            p.productCategory === selectedCategory
          ),
          totalProducts: products.length,
          totalCategories: categories.length,
        },
      },
    });
    setLocation('/step3');
  };

  // Go back to Step 1
  const handleBack = () => {
    setLocation('/step1');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <StepHeader
          currentStep={2}
          totalSteps={7}
          title="Lender Matching"
          description="Your application will be matched with suitable lenders after document review"
        />

        <div className="max-w-4xl mx-auto mt-8">
          <Card className="border-2 border-teal-200 dark:border-teal-700">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-teal-600 dark:text-teal-400" />
              </div>
              <CardTitle className="text-2xl text-teal-700 dark:text-teal-300">
                Lender Matching In Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {products.length > 0 ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-lg text-green-700">
                    {products.length} lender products loaded and ready for recommendations.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription className="text-lg">
                    Loading lender products from staff app...
                  </AlertDescription>
                </Alert>
              )}

              {categories.length > 0 && (
                <div className="bg-white rounded-lg p-6 border">
                  <h3 className="text-lg font-semibold mb-4">Available Product Categories</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        onClick={() => setSelectedCategory(category)}
                        className="text-left justify-start"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                  {selectedCategory && (
                    <div className="mt-4 p-4 bg-teal-50 rounded">
                      <p className="text-sm text-teal-700">
                        Selected: <strong>{selectedCategory}</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  What happens next?
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-teal-500 text-white rounded-full flex items-center justify-center mx-auto font-bold text-lg">
                      1
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Complete your application
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto font-bold text-lg">
                      2
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Upload required documents
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto font-bold text-lg">
                      3
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Our team matches you with lenders
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Security Notice:</strong> Lender recommendations are processed server-side 
                  to ensure the best matches and protect sensitive financial data.
                </p>
              </div>

              <div className="flex gap-4 justify-center pt-6">
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  className="px-8"
                >
                  ← Back to Step 1
                </Button>
                <Button 
                  onClick={handleContinue}
                  className="px-8 bg-teal-600 hover:bg-teal-700"
                >
                  Continue to Application →
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Debug info for development */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="mt-4 border-gray-200">
              <CardHeader>
                <CardTitle className="text-sm">Development Info</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600">
                  Step 1 Data: {JSON.stringify(state.step1, null, 2)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}