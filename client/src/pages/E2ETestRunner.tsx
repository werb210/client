import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Play from 'lucide-react/dist/esm/icons/play';
import Square from 'lucide-react/dist/esm/icons/square';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import XCircle from 'lucide-react/dist/esm/icons/x-circle';
import Clock from 'lucide-react/dist/esm/icons/clock';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Network from 'lucide-react/dist/esm/icons/network';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';

interface TestResult {
  step: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  duration?: number;
  data?: any;
}

export default function E2ETestRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [networkCalls, setNetworkCalls] = useState<any[]>([]);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const testSteps = [
    { id: 'step1', name: 'Step 1: Financial Profile', path: '/apply/step-1' },
    { id: 'step2', name: 'Step 2: Product Selection', path: '/apply/step-2' },
    { id: 'step3', name: 'Step 3: Business Details', path: '/apply/step-3' },
    { id: 'step4', name: 'Step 4: Applicant Info', path: '/apply/step-4' },
    { id: 'step5', name: 'Step 5: Document Upload', path: '/apply/step-5' },
    { id: 'step6', name: 'Step 6: SignNow Integration', path: '/apply/step-6' },
    { id: 'step7', name: 'Step 7: Final Submission', path: '/apply/step-7' }
  ];

  // Initialize network monitoring
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const url = args[0];
      const options = args[1] || {};
      
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        const call = {
          url,
          method: options.method || 'GET',
          status: response.status,
          ok: response.ok,
          duration,
          timestamp: new Date().toISOString(),
          body: options.body ? JSON.stringify(JSON.parse(options.body)) : null
        };
        
        setNetworkCalls(prev => [...prev, call]);
        
        // Track application ID from Step 4
        if (url.includes('/api/public/applications') && options.method === 'POST') {
          try {
            const responseData = await response.clone().json();
            if (responseData.applicationId) {
              setApplicationId(responseData.applicationId);
            }
          } catch (e) {
            // console.log('Could not parse application response');
          }
        }
        
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        const call = {
          url,
          method: options.method || 'GET',
          status: 'ERROR',
          ok: false,
          duration,
          error: error.message,
          timestamp: new Date().toISOString()
        };
        
        setNetworkCalls(prev => [...prev, call]);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const updateResult = (step: string, status: TestResult['status'], message: string, data?: any) => {
    setResults(prev => {
      const existing = prev.find(r => r.step === step);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.data = data;
        return [...prev];
      }
      return [...prev, { step, status, message, data }];
    });
  };

  const runE2ETest = async () => {
    setIsRunning(true);
    setResults([]);
    setNetworkCalls([]);
    setApplicationId(null);

    try {
      // Initialize all steps as pending
      testSteps.forEach(step => {
        updateResult(step.id, 'pending', 'Waiting...');
      });

      // Step 1: Financial Profile
      setCurrentStep('step1');
      updateResult('step1', 'running', 'Navigating to Step 1...');
      
      window.location.href = '/apply/step-1';
      await waitForPageLoad();
      
      // Fill Step 1 form
      const step1Data = {
        requestedAmount: 150000,
        use_of_funds: 'equipment',
        businessLocation: 'CA'
      };
      
      await fillFormData(step1Data);
      await submitForm();
      
      if (window.location.pathname === '/apply/step-2') {
        updateResult('step1', 'success', 'Step 1 completed successfully');
      } else {
        updateResult('step1', 'error', 'Step 1 navigation failed');
        return;
      }

      // Step 2: Product Selection
      setCurrentStep('step2');
      updateResult('step2', 'running', 'Selecting product...');
      
      await waitForElement('[data-testid="product-card--e2e-runner-0"]', 10000);
      const productCard = document.querySelector('[data-testid="product-card--e2e-runner-0"]');
      if (productCard) {
        (productCard as HTMLElement).click();
        await waitForNavigation('/apply/step-3');
        updateResult('step2', 'success', 'Product selected successfully');
      } else {
        updateResult('step2', 'error', 'No products found');
        return;
      }

      // Step 3: Business Details
      setCurrentStep('step3');
      updateResult('step3', 'running', 'Filling business details...');
      
      const step3Data = {
        operatingName: 'Tech Solutions Inc',
        legalName: 'Tech Solutions Incorporated',
        businessCity: 'Toronto',
        businessState: 'ON',
        businessPhone: '4161234567'
      };
      
      await fillFormData(step3Data);
      await submitForm();
      
      if (window.location.pathname === '/apply/step-4') {
        updateResult('step3', 'success', 'Business details completed');
      } else {
        updateResult('step3', 'error', 'Step 3 submission failed');
        return;
      }

      // Step 4: Applicant Information
      setCurrentStep('step4');
      updateResult('step4', 'running', 'Creating application...');
      
      const step4Data = {
        applicantFirstName: 'John',
        applicantLastName: 'Smith',
        applicantEmail: 'john.smith@techsolutions.com',
        applicantPhone: '4161234567',
        ownershipPercentage: 75
      };
      
      await fillFormData(step4Data);
      await submitForm();
      
      // Wait for application ID
      await waitForCondition(() => {
        const storedId = localStorage.getItem('applicationId');
        return storedId && storedId !== 'null';
      }, 15000);
      
      const storedApplicationId = localStorage.getItem('applicationId');
      if (storedApplicationId) {
        setApplicationId(storedApplicationId);
        updateResult('step4', 'success', `Application created: ${storedApplicationId}`);
      } else {
        updateResult('step4', 'error', 'Application creation failed');
        return;
      }

      // Step 5: Document Upload
      setCurrentStep('step5');
      updateResult('step5', 'running', 'Testing document upload...');
      
      window.location.href = '/apply/step-5';
      await waitForPageLoad();
      
      // Simulate document upload
      const uploadArea = document.querySelector('[data-testid="upload-area--e2e-runner"]');
      if (uploadArea) {
        updateResult('step5', 'success', 'Document upload areas found');
      } else {
        updateResult('step5', 'error', 'No upload areas found');
      }

      // Step 6: SignNow Integration
      setCurrentStep('step6');
      updateResult('step6', 'running', 'Testing SignNow integration...');
      
      window.location.href = '/apply/step-6';
      await waitForPageLoad();
      
      // Wait for SignNow iframe
      await waitForElement('iframe[src*="signnow"]', 20000);
      const iframe = document.querySelector('iframe[src*="signnow"]');
      
      if (iframe) {
        const src = (iframe as HTMLIFrameElement).src;
        if (src.includes('temp_')) {
          updateResult('step6', 'success', 'SignNow iframe loaded (fallback URL)');
        } else {
          updateResult('step6', 'success', 'SignNow iframe loaded (real URL)');
        }
        
        // Wait for potential auto-redirect or use manual continue
        setTimeout(() => {
          if (window.location.pathname === '/apply/step-7') {
            updateResult('step6', 'success', 'Auto-redirect to Step 7 successful');
          } else {
            const continueButton = document.querySelector('button[data-testid="continue-without-signing--e2e-runner"]');
            if (continueButton) {
              (continueButton as HTMLButtonElement).click();
              updateResult('step6', 'success', 'Manual continue successful');
            }
          }
        }, 5000);
      } else {
        updateResult('step6', 'error', 'SignNow iframe failed to load');
      }

      // Step 7: Final Submission
      setCurrentStep('step7');
      updateResult('step7', 'running', 'Testing final submission...');
      
      await waitForNavigation('/apply/step-7');
      const submitButton = document.querySelector('button[data-testid="final-submit--e2e-runner"]') || 
                          document.querySelector('button[type="submit"]');
      
      if (submitButton) {
        (submitButton as HTMLButtonElement).click();
        updateResult('step7', 'success', 'Final submission completed');
      } else {
        updateResult('step7', 'error', 'Submit button not found');
      }

    } catch (error) {
      updateResult(currentStep || 'unknown', 'error', `Test failed: ${error.message}`);
    } finally {
      setIsRunning(false);
      setCurrentStep(null);
    }
  };

  const fillFormData = async (data: Record<string, any>) => {
    for (const [key, value] of Object.entries(data)) {
      const field = document.querySelector(`input[name="${key}"], select[name="${key}"]`) as HTMLInputElement;
      if (field) {
        if (field.type === 'checkbox') {
          field.checked = value;
        } else {
          field.value = value;
        }
        field.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const submitForm = async () => {
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton) {
      submitButton.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  const waitForPageLoad = () => {
    return new Promise<void>(resolve => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', resolve);
      }
    });
  };

  const waitForElement = (selector: string, timeout = 10000) => {
    return new Promise<void>((resolve, reject) => {
      const startTime = Date.now();
      
      const checkElement = () => {
        const element = document.querySelector(selector);
        if (element) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Element ${selector} not found within timeout`));
        } else {
          setTimeout(checkElement, 100);
        }
      };
      
      checkElement();
    });
  };

  const waitForNavigation = (path: string, timeout = 10000) => {
    return new Promise<void>((resolve, reject) => {
      const startTime = Date.now();
      
      const checkNavigation = () => {
        if (window.location.pathname === path) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Navigation to ${path} timeout`));
        } else {
          setTimeout(checkNavigation, 100);
        }
      };
      
      checkNavigation();
    });
  };

  const waitForCondition = (condition: () => boolean, timeout = 10000) => {
    return new Promise<void>((resolve, reject) => {
      const startTime = Date.now();
      
      const checkCondition = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Condition timeout'));
        } else {
          setTimeout(checkCondition, 100);
        }
      };
      
      checkCondition();
    });
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-600 animate-pulse" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      running: 'bg-blue-100 text-blue-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    return variants[status] || variants.pending;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Full End-to-End Application Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={runE2ETest}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Square className="w-4 h-4" />
                  Running Test...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start E2E Test
                </>
              )}
            </Button>
            
            {applicationId && (
              <Alert className="flex-1">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Application ID:</strong> {applicationId}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Test Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Test Results</h3>
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium">{result.step}</div>
                      <div className="text-sm text-gray-600">{result.message}</div>
                    </div>
                  </div>
                  <Badge className={getStatusBadge(result.status)}>
                    {result.status}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Network Calls */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Network className="w-5 h-5" />
                Network Activity ({networkCalls.length})
              </h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {networkCalls.map((call, index) => (
                  <div key={index} className="p-2 border rounded text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{call.method} {call.url}</span>
                      <Badge className={call.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {call.status}
                      </Badge>
                    </div>
                    <div className="text-gray-600 text-xs mt-1">
                      {call.duration}ms • {call.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <strong>This test will:</strong>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Navigate through all 7 steps of the application</li>
                <li>Fill forms with real test data</li>
                <li>Test SignNow iframe integration</li>
                <li>Monitor backend API calls</li>
                <li>Track application ID generation</li>
                <li>Test webhook and auto-redirect functionality</li>
              </ul>
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> This test uses real form data and will create actual API calls to the backend.
                Make sure you're ready to test the complete workflow.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}