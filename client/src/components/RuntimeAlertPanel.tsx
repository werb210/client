import React, { useState, useEffect } from 'react';
import { useFormData } from '@/context/FormDataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

import FileText from 'lucide-react/dist/esm/icons/file-text';

import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import X from 'lucide-react/dist/esm/icons/x';

interface RuntimeAlertPanelProps {
  currentStep: 5 | 7;
}

export function RuntimeAlertPanel({ currentStep }: RuntimeAlertPanelProps) {
  // Only show in development mode
  const isDevelopment = import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';
  
  const { data } = useFormData();
  const state = data || {};
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [documentsUploaded, setDocumentsUploaded] = useState<number>(0);



  const applicationId = state.applicationId || localStorage.getItem('applicationId');

  // Check document upload status
  useEffect(() => {
    const checkDocuments = async () => {
      if (!applicationId) return;
      
      try {
        const response = await fetch(`/api/public/documents/${applicationId}`, { credentials: 'include' });
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



  // Don't show panel if no alerts or user dismissed it
  // Don't show in production
  if (!isDevelopment || alerts.length === 0 || !isVisible) {
    return null;
  }

  return null;
}