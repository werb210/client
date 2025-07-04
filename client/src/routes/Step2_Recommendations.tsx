import { useState } from 'react';
import { useFormData } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { Step2RecommendationEngine } from '@/components/Step2RecommendationEngine';

export default function Step2Recommendations() {
  const { state, dispatch } = useFormData();
  const [, setLocation] = useLocation();
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  // Get user's Step 1 data for matching
  const step1Data = state.step1FinancialProfile;
  
  // Convert form data to match Step2RecommendationEngine interface
  const formData = step1Data ? {
    headquarters: step1Data.businessLocation === 'united-states' ? 'US' : 
                  step1Data.businessLocation === 'canada' ? 'CA' : 
                  step1Data.businessLocation,
    industry: step1Data.industry,
    lookingFor: step1Data.lookingFor,
    fundingAmount: step1Data.fundingAmount,
    fundsPurpose: step1Data.useOfFunds,
    accountsReceivableBalance: step1Data.accountsReceivable || '',
    // Additional fields for context
    salesHistory: step1Data.salesHistory,
    averageMonthlyRevenue: step1Data.monthlyRevenue,
  } : {};

  const handleProductSelect = (product: string) => {
    setSelectedProduct(product);
    dispatch({
      type: 'UPDATE_STEP1',
      payload: {
        selectedCategory: product
      }
    });
  };

  const handleContinue = () => {
    // Production validation: Require product selection
    if (!selectedProduct) {
      alert('Please select a product category before continuing.');
      return;
    }
    
    dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
    setLocation('/apply/step-3');
  };

  const handlePrevious = () => {
    setLocation('/apply/step-1');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Step2RecommendationEngine
          formData={formData}
          selectedProduct={selectedProduct}
          onProductSelect={handleProductSelect}
          onContinue={handleContinue}
          onPrevious={handlePrevious}
        />
      </div>
    </div>
  );
}