import React, { useEffect } from 'react';
import Building from 'lucide-react/dist/esm/icons/building';
import Target from 'lucide-react/dist/esm/icons/target';
import User from 'lucide-react/dist/esm/icons/user';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Upload from 'lucide-react/dist/esm/icons/upload';
import FileSignature from 'lucide-react/dist/esm/icons/file-signature';
import { useFormData } from '@/context/FormDataContext';
import { useAutoSave } from '@/hooks/useAutoSave';
import { ProgressMonitor } from './ProgressMonitor';
import { AutoSaveIndicator } from './AutoSaveIndicator';

// Steps configuration matching our 6-step workflow
const steps = [
  { title: "Financial Profile", icon: Building },
  { title: "Recommendations", icon: Target },
  { title: "Business Details", icon: User },
  { title: "Applicant Info", icon: FileText },
  { title: "Documents", icon: Upload },
  { title: "Submit & Sign", icon: FileSignature },
];

interface StageMonitorProps {
  currentStep: number;
}

export function StageMonitor({ currentStep }: StageMonitorProps) {
  const { data } = useFormData();
  const state = data || {};
  
  // Auto-save integration with security controls
  const { status, lastSaveTime, loadData, clearData } = useAutoSave({
    key: 'borealFinancialApplicationAutoSave',
    data: { ...state, currentStep },
    interval: 30000, // 30 seconds
    delay: 2000, // 2 seconds after changes
    maxAge: 72, // 72 hours
    securitySteps: [5] // Don't auto-restore to signature step
  });

  // Load saved data on mount
  useEffect(() => {
    const savedData = loadData();
    if (savedData?.restoredFromAutoSave) {
      // console.log('📋 Restored form data from auto-save');
      // Note: Form data restoration would be handled by FormDataProvider
      // This is just for monitoring and user feedback
    }
  }, [loadData]);

  // Clear auto-save data when application is completed
  useEffect(() => {
    if (state.applicationId && currentStep === 5) {
      // Clear auto-save when application is submitted
      const timer = setTimeout(() => {
        try {
          clearData();
          // console.log('🎉 Application submitted - auto-save data cleared');
        } catch (error) {
          // Silently ignore auto-save cleanup errors
        }
      }, 5000); // Wait 5 seconds to ensure submission is complete

      return () => clearTimeout(timer);
    }
  }, [state.applicationId, currentStep, clearData]);

  return (
    <div className="mb-6">
      {/* Auto Save Status - positioned in top right */}
      <div className="flex justify-end mb-4">
        <AutoSaveIndicator 
          status={status} 
          lastSaveTime={lastSaveTime} 
        />
      </div>
      
      {/* Progress Monitor */}
      <ProgressMonitor 
        steps={steps} 
        currentStep={currentStep} 
      />
    </div>
  );
}