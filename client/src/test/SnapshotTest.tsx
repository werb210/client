import React, { useEffect, useState } from 'react';

export default function SnapshotTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTestingSubmission, setIsTestingSubmission] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testFormSnapshot = async () => {
    setIsTestingSubmission(true);
    addResult('🧪 Starting form snapshot test...');

    try {
      // 1. Setup form state in localStorage to simulate filled form
      const testFormData = {
        step1: {
          requestedAmount: 50000,
          fundingAmount: 50000,
          businessLocation: 'US',
          industry: 'technology',
          purpose: 'working_capital',
          yearsInBusiness: 3,
          years_in_business: 36,
          avgMonthlyRevenue: 15000,
          monthly_revenue: 15000,
          salesHistory: '3_plus_years'
        },
        step2: {
          selectedCategory: 'Working Capital',
          selectedCategoryName: 'Working Capital',
          selectedProductId: 'test-product-123',
          selectedLenderName: 'Test Lender'
        },
        step3: {
          legalName: 'Test Business LLC',
          operatingName: 'Test Business',
          businessPhone: '555-123-4567',
          contactName: 'John Smith',
          contactEmail: 'john@testbusiness.com',
          contactPhone: '555-123-4567'
        },
        step4: {
          firstName: 'John',
          lastName: 'Smith',
          email: 'john@testbusiness.com',
          phone: '555-123-4567'
        }
      };

      // Store test data in localStorage
      localStorage.setItem('bf:intake', JSON.stringify(testFormData.step1));
      localStorage.setItem('bf:step2', JSON.stringify(testFormData.step2));
      localStorage.setItem('bf:step3', JSON.stringify(testFormData.step3));
      localStorage.setItem('bf:step4', JSON.stringify(testFormData.step4));
      localStorage.setItem('bf:docs', JSON.stringify({ uploadedDocuments: [], bypassedDocuments: [] }));

      // 2. Setup global state for snapshot capture
      (window as any).__APP_STATE__ = {
        currentStep: 7,
        formData: testFormData,
        allFormFields: {
          ...testFormData.step1,
          ...testFormData.step2,
          ...testFormData.step3,
          ...testFormData.step4,
          submissionTimestamp: new Date().toISOString()
        }
      };

      addResult('📋 Test form data populated in localStorage and __APP_STATE__');

      // 3. Intercept fetch and test submission
      const originalFetch = window.fetch;
      let interceptedPayload: any = null;

      window.fetch = async (url: any, opts: any) => {
        if (typeof url === 'string' && /\/v1\/applications$/.test(url) && opts?.method === 'POST') {
          try {
            const body = JSON.parse(opts.body || '{}');
            interceptedPayload = body;
            
            addResult(`📤 SUBMISSION PAYLOAD KEYS: ${Object.keys(body).length} keys: [${Object.keys(body).join(', ')}]`);
            
            const snap = body.payload || body.formFields;
            if (snap) {
              const nestedKeys = Object.keys(snap);
              addResult(`✅ SNAPSHOT PRESENT? true, nested keys: ${nestedKeys.length}`);
              addResult(`📊 Snapshot contains: [${nestedKeys.slice(0, 10).join(', ')}${nestedKeys.length > 10 ? '...' : ''}]`);
            } else {
              addResult(`❌ SNAPSHOT PRESENT? false (none)`);
            }
            
            // Don't actually send to server, return mock response
            return new Response(JSON.stringify({ ok: true, submission_id: 'test-123', status: 'QUEUED' }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          } catch (e) {
            addResult(`⚠️ Error parsing payload: ${e}`);
          }
        }
        return originalFetch(url, opts);
      };

      // 4. Import and test submission function
      const { submitApplication } = await import('../lib/submitApplication');
      
      const testPayload = {
        product_id: testFormData.step2.selectedProductId || 'test-product',
        country: 'US' as const,
        amount: testFormData.step1.requestedAmount || 50000,
        years_in_business: testFormData.step1.years_in_business || 36,
        monthly_revenue: testFormData.step1.monthly_revenue || 15000,
        business_legal_name: testFormData.step3.legalName || 'Test Business LLC',
        industry: testFormData.step1.industry || 'technology',
        contact_name: testFormData.step3.contactName || 'John Smith',
        contact_email: testFormData.step3.contactEmail || 'john@testbusiness.com',
        contact_phone: testFormData.step3.contactPhone || '555-123-4567',
        documents: []
      };

      addResult('🚀 Testing submission with payload...');

      try {
        await submitApplication(testPayload);
        addResult('✅ Submission test completed successfully');
      } catch (error) {
        addResult(`⚠️ Submission test completed with expected error: ${error}`);
      }

      // 5. Restore original fetch
      window.fetch = originalFetch;

      // 6. Analysis
      if (interceptedPayload) {
        const coreFields = ['product_id', 'country', 'amount', 'years_in_business', 'monthly_revenue', 'business_legal_name', 'industry', 'contact_name', 'contact_email', 'contact_phone', 'documents'];
        const enhancedFields = ['payload', 'formFields'];
        
        const hasCoreFields = coreFields.every(field => field in interceptedPayload);
        const hasSnapshot = enhancedFields.some(field => field in interceptedPayload);
        
        addResult(`🔍 Analysis: Core fields present: ${hasCoreFields}, Snapshot present: ${hasSnapshot}`);
        
        if (hasSnapshot) {
          addResult('🎉 SUCCESS: Lossless form snapshot is working correctly!');
        } else {
          addResult('❌ ISSUE: Snapshot not found in payload - check VITE_LOSSLESS_SUBMIT setting');
        }
      }

    } catch (error) {
      addResult(`❌ Test failed: ${error}`);
    } finally {
      setIsTestingSubmission(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Form Snapshot Test</h1>
      
      <div className="space-y-4 mb-6">
        <button 
          onClick={testFormSnapshot}
          disabled={isTestingSubmission}
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isTestingSubmission ? 'Testing...' : 'Test Form Snapshot Submission'}
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-6">
        <h3 className="font-semibold mb-2">What this test does:</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Populates form data in localStorage (simulates filled form)</li>
          <li>Sets up __APP_STATE__ for snapshot capture</li>
          <li>Intercepts the submission fetch call</li>
          <li>Tests the submitApplication function</li>
          <li>Analyzes if payload includes both core fields AND snapshot</li>
        </ul>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-semibold mb-3">Test Results:</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500 italic">No tests run yet. Click the button above to start.</p>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="font-mono text-sm p-2 bg-gray-50 rounded">
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
        <h3 className="font-semibold text-yellow-800 mb-2">Environment Check:</h3>
        <div className="text-sm text-yellow-700">
          <p>VITE_LOSSLESS_SUBMIT: {import.meta.env.VITE_LOSSLESS_SUBMIT || 'not set'}</p>
          <p>Expected: "1" for snapshot to be included</p>
        </div>
      </div>
    </div>
  );
}