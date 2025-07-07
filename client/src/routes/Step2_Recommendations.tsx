import { useState } from 'react';
import { useFormData } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { Step2RecommendationEngine } from '@/components/Step2RecommendationEngine';

export default function Step2Recommendations() {
  const { state, dispatch } = useFormData();
  const [, setLocation] = useLocation();
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  // Get user's Step 1 data for matching from unified schema
  const formData = {
    headquarters: state.businessLocation === 'united-states' ? 'US' : 
                  state.businessLocation === 'canada' ? 'CA' : 
                  state.businessLocation,
    industry: state.industry,
    lookingFor: state.lookingFor,
    fundingAmount: state.fundingAmount,
    fundsPurpose: state.fundsPurpose,
    accountsReceivableBalance: state.accountsReceivableBalance || '',
    // Additional fields for context
    salesHistory: state.salesHistory,
    averageMonthlyRevenue: state.averageMonthlyRevenue,
  };

  const handleProductSelect = (product: string) => {
    setSelectedProduct(product);
    dispatch({
      type: 'UPDATE_FORM_DATA',
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