import React, { useEffect, useState } from 'react';

export default function FieldCountAnalysis() {
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    // Expose analysis functions globally for easy console access
    (window as any).analyzeFormFields = () => {
      // Deep keys function
      function deepKeys(o: any, p: string[] = []): string[] {
        if (!o || typeof o !== 'object') return [p.join('.')];
        let r: string[] = [];
        for (const k of Object.keys(o)) {
          const v = o[k];
          const nk = [...p, k];
          if (v && typeof v === 'object' && !Array.isArray(v)) {
            r = r.concat(deepKeys(v, nk));
          } else {
            r.push(nk.join('.'));
          }
        }
        return r;
      }

      // Gather state from multiple sources
      const state = (window as any).__APP_STATE__ || {};
      const localStorageState = {
        'bf:intake': JSON.parse(localStorage.getItem('bf:intake') || '{}'),
        'bf:step2': JSON.parse(localStorage.getItem('bf:step2') || '{}'),
        'bf:step3': JSON.parse(localStorage.getItem('bf:step3') || '{}'),
        'bf:step4': JSON.parse(localStorage.getItem('bf:step4') || '{}'),
        'bf:docs': JSON.parse(localStorage.getItem('bf:docs') || '{}'),
      };

      const combinedState = { ...state, localStorage: localStorageState };
      const keys = Array.from(new Set(deepKeys(combinedState)))
        .filter(k => !k.endsWith('.') && !k.match(/^\d+$/))
        .sort();

      // Step-based analysis
      const step1 = keys.filter(k => 
        /Financial|requestedAmount|revenue|monthly|yearsInBusiness|fundsPurpose|salesHistory|accountsReceivable|fixedAssets|equipment|funding|amount|business.*location|industry|purpose/i.test(k)
      );
      const step2 = keys.filter(k => 
        /selected(Category|Product|Lender|Name)|category|product.*id|lender/i.test(k)
      );
      const step3 = keys.filter(k => 
        /(legalName|operatingName|business(Street|City|State|Postal|Phone|Website|StartDate|Structure)|employeeCount|estimatedYearlyRevenue)/i.test(k)
      );
      const step4 = keys.filter(k => 
        /(firstName|lastName|applicant|email|phone|address|city|state|zip|dateOfBirth|ssn|ownership|partner|contact)/i.test(k)
      );
      const documents = keys.filter(k => 
        /document|upload|file|signature|terms|privacy/i.test(k)
      );

      const analysis = {
        totalKeys: keys.length,
        keys: keys,
        stepBreakdown: [
          { step: 'Step 1 (Financial)', count: step1.length, keys: step1 },
          { step: 'Step 2 (Product)', count: step2.length, keys: step2 },
          { step: 'Step 3 (Business)', count: step3.length, keys: step3 },
          { step: 'Step 4 (Applicant)', count: step4.length, keys: step4 },
          { step: 'Documents/Signature', count: documents.length, keys: documents },
        ],
        combinedState
      };

      console.log('=== FORM FIELD ANALYSIS ===');
      console.log('TOTAL FORM KEYS:', analysis.totalKeys);
      console.log('All keys:', analysis.keys);
      console.table(analysis.stepBreakdown.map(s => ({ step: s.step, count: s.count })));
      
      analysis.stepBreakdown.forEach(s => {
        if (s.count > 0) {
          console.log(`${s.step} keys:`, s.keys);
        }
      });

      return analysis;
    };

    // Payload interceptor
    (window as any).interceptSubmissionPayload = () => {
      const _fetch = window.fetch;
      window.fetch = async (url: any, opts: any) => {
        if (typeof url === 'string' && /\/v1\/applications$/.test(url) && opts?.method === 'POST') {
          try {
            const body = JSON.parse(opts.body || '{}');
            const payloadKeys = Object.keys(body);
            console.log('=== SUBMISSION PAYLOAD ANALYSIS ===');
            console.log('SUBMISSION PAYLOAD KEYS:', payloadKeys.length, payloadKeys);
            
            // Analyze nested payload if present
            if (body.payload || body.formFields) {
              const nestedKeys = Object.keys(body.payload || body.formFields || {});
              console.log('NESTED FORM SNAPSHOT KEYS:', nestedKeys.length, nestedKeys);
            }
          } catch (e) {
            console.log('Failed to parse submission payload:', e);
          }
        }
        return _fetch(url, opts);
      };
      console.log('✅ Payload interceptor installed. Submit an application to see payload analysis.');
    };

    console.log('Field analysis functions available:');
    console.log('- window.analyzeFormFields() - Analyze all form fields');
    console.log('- window.interceptSubmissionPayload() - Intercept and analyze submission payload');
  }, []);

  const runAnalysis = () => {
    const analysis = (window as any).analyzeFormFields();
    setResults(analysis);
  };

  const setupInterceptor = () => {
    (window as any).interceptSubmissionPayload();
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Field Count Analysis</h1>
      
      <div className="space-y-4 mb-6">
        <button 
          onClick={runAnalysis}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Analyze Form Fields
        </button>
        
        <button 
          onClick={setupInterceptor}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-4"
        >
          Setup Payload Interceptor
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded mb-6">
        <h3 className="font-semibold mb-2">Console Commands:</h3>
        <div className="font-mono text-sm space-y-2">
          <div>1. <code>window.analyzeFormFields()</code> - Count all form fields</div>
          <div>2. <code>window.interceptSubmissionPayload()</code> - Setup payload analysis</div>
          <div>3. Submit an application to see payload field count</div>
        </div>
      </div>

      {results && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">Field Count Summary</h3>
            <p className="text-lg">Total Form Keys: <strong>{results.totalKeys}</strong></p>
          </div>

          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">Step Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Step</th>
                    <th className="px-4 py-2 text-left">Field Count</th>
                  </tr>
                </thead>
                <tbody>
                  {results.stepBreakdown.map((step: any, idx: number) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-2">{step.step}</td>
                      <td className="px-4 py-2">{step.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">All Form Fields ({results.totalKeys})</h3>
            <div className="max-h-64 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                {results.keys.map((key: string, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-2 rounded font-mono">
                    {key}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-yellow-50 p-4 rounded border-l-4 border-yellow-400">
        <h3 className="font-semibold text-yellow-800 mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
          <li>Click "Analyze Form Fields" to count all fields currently in the form state</li>
          <li>Click "Setup Payload Interceptor" to monitor submission payloads</li>
          <li>Go to Step 7 and submit an application to see the payload analysis</li>
          <li>Check the browser console for detailed field listings</li>
        </ol>
      </div>
    </div>
  );
}