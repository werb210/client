import { useState, useEffect } from 'react';
import { logger } from '@/lib/utils';
import { useFormData } from '@/context/FormDataContext';

import { useLocation } from 'wouter';

import { Step2RecommendationEngine } from '@/components/Step2RecommendationEngine';

import { StepHeader } from '@/components/StepHeader';

import { useDebouncedCallback } from 'use-debounce';


export default function Step2Recommendations() {
  const { state, dispatch } = useFormData();
  const [, setLocation] = useLocation();
  const [selectedProduct, setSelectedProduct] = useState<string>('');

  // ✅ GA TEST EVENT - Fire on page load
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'ga_test_event', {
        step: 'step_2_product_recommendations',
        source: 'auto_debug',
        verified: true,
      });
      console.log('✅ GA test event fired automatically on load');
    } else {
      console.warn('⚠️ gtag is not defined. GA event not sent.');
    }
  }, []);

  // Get user's Step 1 data for matching from unified schema
  const normalizeHeadquarters = (location: string): string => {
    if (location === 'united-states' || location === 'United States' || location === 'US') return 'US';
    if (location === 'canada' || location === 'Canada' || location === 'CA') return 'CA';
    return location || 'US';
  };

  // CRITICAL FIX: Use businessLocation field directly since it's already normalized as CA/US in Step 1
  const formData = {
    headquarters: state.step1?.businessLocation || 'US', // Use businessLocation directly, it's already CA/US format
    industry: state.step1?.industry,
    lookingFor: state.step1?.lookingFor,
    fundingAmount: state.step1?.fundingAmount,
    fundsPurpose: state.step1?.fundsPurpose,
    accountsReceivableBalance: state.step1?.accountsReceivableBalance || 0,
    // Additional fields for context
    salesHistory: state.step1?.salesHistory,
    averageMonthlyRevenue: state.step1?.averageMonthlyRevenue,
  };

  // ✅ STEP 1: REVIEW STATE STRUCTURE (ChatGPT Instructions)
  logger.log("Step 1 Data:", state.step1);
  logger.log("Step 3 Data:", state.step3);
  logger.log('[STEP2] Form data passed to filtering:', formData);
  logger.log('[STEP2] Raw Step 1 data:', {
    businessLocation: state.step1?.businessLocation,
    headquarters: state.step1?.headquarters,
    lookingFor: state.step1?.lookingFor,
    fundingAmount: state.step1?.fundingAmount,
    accountsReceivableBalance: state.step1?.accountsReceivableBalance
  });

  // Debug logging disabled for production
  // All form data passed to filtering algorithm

  const handleProductSelect = (product: string) => {
    setSelectedProduct(product);
    // ✅ STEP 4: STORE SELECTED CATEGORY PROPERLY (ChatGPT Instructions)
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        step2: {
          selectedCategory: product,
          selectedCategoryName: product
        }
      }
    });
    // ✅ STEP 5: DEBUG DISPLAY (ChatGPT Instructions)
    logger.log("Selected Category:", product);
    logger.log("Updated state.step2?.selectedCategory:", product);
  };

  // Auto-save selected product with 2-second delay
  const debouncedSave = useDebouncedCallback((product: string) => {
    if (product) {
      // STEP-BASED COMPLIANCE: Store selection in step2 object
      dispatch({
        type: 'UPDATE_FORM_DATA',
        payload: {
          step2: {
            selectedCategory: product,
            selectedCategoryName: product,
            completed: true
          }
        }
      });
      logger.log('💾 Step 2 - Auto-saved product selection to step2 object:', product);
      logger.log("Final state.step2?.selectedCategory:", product);
      logger.log("Context state after auto-save:", state.step2);
    }
  }, 2000);

  // Trigger autosave when product selection changes
  useEffect(() => {
    if (selectedProduct) {
      debouncedSave(selectedProduct);
    }
  }, [selectedProduct, debouncedSave]);

  const handleContinue = () => {
    // Production validation: Require product selection
    if (!selectedProduct) {
      alert('Please select a product category before continuing.');
      return;
    }
    
    // Emit GTM step_completed event
    const applicationId = localStorage.getItem('applicationId');
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 
      event: 'step_completed', 
      step: 2, 
      application_id: applicationId, 
      product_type: selectedProduct 
    });
    
    dispatch({ type: 'SET_CURRENT_STEP', payload: 3 });
    setLocation('/apply/step-3');
  };

  const handlePrevious = () => {
    setLocation('/apply/step-1');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <StepHeader 
          stepNumber={2}
          title="Product Recommendations"
          description="Select the best financing option based on your business profile"
        />
        
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