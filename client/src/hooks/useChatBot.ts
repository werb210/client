import { useState, useEffect } from "react";

export interface ApplicationData {
  step?: number;
  businessName?: string;
  amount?: number;
  country?: string;
  loanPurpose?: string;
  [key: string]: any;
}

export function useChatBot() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [applicationData, setApplicationData] = useState<ApplicationData>({});

  // Sync with application state from localStorage or context
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('applicationData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setApplicationData(parsed);
        setCurrentStep(parsed.step || 1);
      }
    } catch (error) {
      console.warn('Could not load application data for chatbot:', error);
    }
  }, []);

  const updateApplicationData = (data: Partial<ApplicationData>) => {
    setApplicationData(prev => {
      const updated = { ...prev, ...data };
      try {
        localStorage.setItem('applicationData', JSON.stringify(updated));
      } catch (error) {
        console.warn('Could not save application data:', error);
      }
      return updated;
    });
  };

  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  return {
    currentStep,
    setCurrentStep,
    applicationData,
    setApplicationData: updateApplicationData,
    isOpen,
    toggleChat,
  };
}