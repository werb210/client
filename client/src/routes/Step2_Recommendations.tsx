import { useFormData } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { StepHeader } from '@/components/StepHeader';
import { Step2RecommendationEngine } from '@/components/Step2RecommendationEngine';

export default function Step2Recommendations() {
  const { state, dispatch } = useFormData();
  const [, setLocation] = useLocation();

  const handleProductSelect = (product: string) => {
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        selectedProduct: product
      }
    });
  };

  const handleContinue = () => {
    // Save the selected product to step2 data
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        step2: {
          selectedProduct: state.selectedProduct,
          completed: true,
        },
      },
    });
    setLocation('/step3');
  };

  const handleBack = () => {
    setLocation('/step1');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <StepHeader
          stepNumber={2}
          totalSteps={7}
          title="Lender Recommendations"
          description="Based on your financial profile, here are the best loan products for you"
        />

        <div className="max-w-4xl mx-auto mt-8">
          <Step2RecommendationEngine
            formData={state}
            selectedProduct={state.selectedProduct || ''}
            onProductSelect={handleProductSelect}
            onContinue={handleContinue}
            onPrevious={handleBack}
          />
        </div>
      </div>
    </div>
  );
}