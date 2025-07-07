import { useState, useEffect } from 'react';

export interface OnboardingState {
  isActive: boolean;
  currentStep: number;
  hasSeenWalkthrough: boolean;
  isComplete: boolean;
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    isActive: false,
    currentStep: 0,
    hasSeenWalkthrough: false,
    isComplete: false
  });

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('boreal-onboarding-complete') === 'true';
    const hasSeenWalkthrough = localStorage.getItem('boreal-walkthrough-seen') === 'true';
    
    setState(prev => ({
      ...prev,
      hasSeenWalkthrough,
      isComplete: hasSeenOnboarding
    }));
  }, []);

  const startOnboarding = () => {
    setState(prev => ({
      ...prev,
      isActive: true,
      currentStep: 0
    }));
  };

  const nextStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: prev.currentStep + 1
    }));
  };

  const previousStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1)
    }));
  };

  const skipOnboarding = () => {
    localStorage.setItem('boreal-walkthrough-seen', 'true');
    setState(prev => ({
      ...prev,
      isActive: false,
      hasSeenWalkthrough: true
    }));
  };

  const completeOnboarding = () => {
    localStorage.setItem('boreal-onboarding-complete', 'true');
    setState(prev => ({
      ...prev,
      isActive: false,
      isComplete: true
    }));
  };

  const resetOnboarding = () => {
    localStorage.removeItem('boreal-onboarding-complete');
    localStorage.removeItem('boreal-walkthrough-seen');
    setState({
      isActive: false,
      currentStep: 0,
      hasSeenWalkthrough: false,
      isComplete: false
    });
  };

  return {
    state,
    startOnboarding,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
    resetOnboarding
  };
}