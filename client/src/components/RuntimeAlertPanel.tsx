import React, { useState, useEffect } from 'react';
import { useFormDataContext } from '@/context/FormDataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Edit from 'lucide-react/dist/esm/icons/edit';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import X from 'lucide-react/dist/esm/icons/x';

interface RuntimeAlertPanelProps {
  currentStep: 5 | 6 | 7;
}

export function RuntimeAlertPanel({ currentStep }: RuntimeAlertPanelProps) {
  // Only show in development mode
  const isDevelopment = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';
  
  const { state } = useFormDataContext();
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [documentsUploaded, setDocumentsUploaded] = useState<number>(0);
  const [signingStatus, setSigningStatus] = useState<string>('unknown');
  const [prefillIssues, setPrefillIssues] = useState<string[]>([]);

  const applicationId = state.applicationId || localStorage.getItem('applicationId');

  // Check document upload status
  useEffect(() => {
    const checkDocuments = async () => {
      if (!applicationId) return;
      
      try {
        const response = await fetch(`/api/public/documents/${applicationId}`);
        if (response.ok) {
          const data = await response.json();
          setDocumentsUploaded(data?.documents?.length || 0);
        }
      } catch (error) {
        console.error('Error checking documents:', error);
      }
    };

    checkDocuments();
  }, [applicationId]);

  // Check signing status
  useEffect(() => {
    const checkSigningStatus = async () => {
      if (!applicationId) return;
      
      try {
        const response = await fetch(`/api/public/signnow/status/${applicationId}`);
        if (response.ok) {
          const data = await response.json();
          setSigningStatus(data?.status || data?.signing_status || 'unknown');
        }
      } catch (error) {
        console.error('Error checking signing status:', error);
      }
    };

    checkSigningStatus();
  }, [applicationId]);

  // Check prefill payload completeness
  useEffect(() => {
    const requiredFields = [
      { key: 'first_name', value: state.step4?.firstName },
      { key: 'business_name', value: state.step3?.operatingName || state.step3?.legalName },
      { key: 'amount_requested', value: state.step1?.requestedAmount }
    ];

    const missing = requiredFields.filter(field => !field.value).map(field => field.key);
    setPrefillIssues(missing);
  }, [state.step1, state.step3, state.step4]);

  // Determine what alerts to show
  const alerts = [];

  // Document upload alert (Steps 5, 6, 7)
  if (documentsUploaded === 0) {
    alerts.push({
      type: 'error' as const,
      icon: <FileText className="w-4 h-4" />,
      title: 'No Documents Uploaded',
      description: 'Please upload required documents in Step 5 before proceeding.',
      action: currentStep !== 5 ? { label: 'Go to Step 5', onClick: () => setLocation('/apply/step-5') } : undefined
    });
  }

  // Prefill issues alert (Steps 6, 7)
  if (prefillIssues.length > 0 && currentStep >= 6) {
    alerts.push({
      type: 'warning' as const,
      icon: <Edit className="w-4 h-4" />,
      title: 'Missing Required Fields',
      description: `Fields missing for SignNow prefill: ${prefillIssues.join(', ')}`,
      action: { label: 'Complete Form', onClick: () => setLocation('/apply/step-4') }
    });
  }

  // Signing status alert (Step 7)
  if (currentStep === 7 && signingStatus !== 'signed' && signingStatus !== 'invite_signed' && signingStatus !== 'bypassed') {
    alerts.push({
      type: 'error' as const,
      icon: <AlertTriangle className="w-4 h-4" />,
      title: 'Signature Required',
      description: `Document status: ${signingStatus}. Please complete signing before final submission.`,
      action: { label: 'Go to Step 6', onClick: () => setLocation('/apply/step-6') }
    });
  }

  // Don't show panel if no alerts or user dismissed it
  // Don't show in production
  if (!isDevelopment || alerts.length === 0 || !isVisible) {
    return null;
  }

  return null;
}