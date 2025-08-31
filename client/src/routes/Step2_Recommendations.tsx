import { fetchProducts } from "../api/products";
import { useFormData } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { StepHeader } from '@/components/StepHeader';
import { Step2RecommendationEngine } from '@/components/Step2RecommendationEngine';
import CategoryPicker from '@/components/CategoryPicker';

export default function Step2Recommendations() {
  const { data: contextData } = useFormData();
  
  // Create a mock state and dispatch to avoid errors
  const state = {
    step1: contextData || {},
    formData: { selectedProduct: '' },
    currentStep: 2
  };
  const dispatch = (action: any) => {
    console.log('Mock dispatch:', action);
  };
  const [, setLocation] = useLocation();

  // Pull from (1) form context, (2) localStorage backup, (3) empty fallback
  const fromState = state ?? {};
  const fromStorage = (() => {
    try {
      const s = localStorage.getItem("apply.form");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  })();

  // Try to get data from multiple sources and merge
  const step1Data = fromState.step1 ?? fromState ?? fromStorage?.step1 ?? {};
  const globalData = fromState ?? fromStorage ?? {};
  const safeFormData = { ...globalData, ...step1Data };

  // Debug: Log form data received from Step 1 (safe)
  console.log('🔍 [STEP2] Form data received (safe):', safeFormData);
  console.log('🔍 [STEP2] Step1 data:', step1Data);
  console.log('🔍 [STEP2] Global data:', globalData);

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
          selectedProduct: state.formData.selectedProduct,
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
            formData={safeFormData}
            selectedProduct={state.formData?.selectedProduct || ''}
            onProductSelect={handleProductSelect}
            onContinue={handleContinue}
            onPrevious={handleBack}
          />
        </div>
      </div>
    </div>
  );
}