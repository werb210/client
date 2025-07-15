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
  if (alerts.length === 0 || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-orange-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Runtime Validation
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border ${
                alert.type === 'error' ? 'bg-red-50 border-red-200' : 
                alert.type === 'warning' ? 'bg-amber-50 border-amber-200' : 
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start gap-2">
                  <div className={`mt-0.5 ${
                    alert.type === 'error' ? 'text-red-600' : 
                    alert.type === 'warning' ? 'text-amber-600' : 
                    'text-blue-600'
                  }`}>
                    {alert.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium text-sm mb-1 ${
                      alert.type === 'error' ? 'text-red-800' : 
                      alert.type === 'warning' ? 'text-amber-800' : 
                      'text-blue-800'
                    }`}>
                      {alert.title}
                    </div>
                    <div className={`text-xs opacity-90 ${
                      alert.type === 'error' ? 'text-red-700' : 
                      alert.type === 'warning' ? 'text-amber-700' : 
                      'text-blue-700'
                    }`}>
                      {alert.description}
                    </div>
                    {alert.action && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={alert.action.onClick}
                        className="mt-2 h-6 px-2 text-xs"
                      >
                        {alert.action.label}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-orange-200">
            <div className="flex items-center gap-2 text-xs text-orange-600">
              <CheckCircle className="w-3 h-3" />
              Step {currentStep} Validation Active
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}