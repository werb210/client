import { useState, useEffect } from 'react';
import { useFormData } from '@/context/FormDataContext';

export function useChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const { state } = useFormData();

  // Extract current step from URL or state
  const getCurrentStep = (): number => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const match = path.match(/step-(\d+)/);
      if (match) {
        return parseInt(match[1], 10);
      }
    }
    return 1; // Default to step 1
  };

  const [currentStep, setCurrentStep] = useState(getCurrentStep);

  // Update current step when location changes
  useEffect(() => {
    const updateStep = () => {
      setCurrentStep(getCurrentStep());
    };

    // Listen for navigation changes
    window.addEventListener('popstate', updateStep);
    
    // Also check on mount and when URL changes
    updateStep();

    return () => {
      window.removeEventListener('popstate', updateStep);
    };
  }, []);

  // Get relevant application data for context
  const getApplicationContext = () => {
    return {
      businessLocation: state.businessLocation,
      requestedAmount: state.requestedAmount,
      use_of_funds: state.use_of_funds,
      businessName: state.businessName,
      businessStructure: state.businessStructure,
      firstName: state.firstName,
      lastName: state.lastName,
      email: state.email,
      applicationId: state.applicationId || localStorage.getItem('applicationId')
    };
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const openChat = () => {
    setIsOpen(true);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    currentStep,
    applicationData: getApplicationContext(),
    toggleChat,
    openChat,
    closeChat
  };
}