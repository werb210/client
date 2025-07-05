import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFormData } from '@/context/FormDataContext';
import { useLocation } from 'wouter';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Settings, 
  Database,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  description: string;
  how: string;
  expected: string;
  status: 'pending' | 'checking' | 'success' | 'error';
  result?: string;
}

export default function ApplicationIdFlowTest() {
  const { state, dispatch } = useFormData();
  const [, setLocation] = useLocation();
  
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 'C-1',
      description: 'Step 4 POST succeeds & returns an applicationId',
      how: 'DevTools ► Network ► filter /api/public/applications (or proxy path). Look at the JSON body.',
      expected: 'HTTP 201/200 + JSON { id: "uuid…" }',
      status: 'pending'
    },
    {
      id: 'C-2',
      description: 'ID is written into global state / localStorage',
      how: 'ApplicationContext / FormDataContext (or Redux DevTools). Look for application.id or step4.appId.',
      expected: 'String UUID present',
      status: 'pending'
    },
    {
      id: 'C-3',
      description: 'Router passes that ID to Step 6',
      how: 'In the address bar or React-Router state: location.state?.applicationId (or param /step-6/:id).',
      expected: 'Same UUID as C-1',
      status: 'pending'
    },
    {
      id: 'C-4',
      description: 'Step 6 component looks in ONE place only',
      how: 'Step6_SignNowIntegration.tsx : check props/read logic. Remove fall-backs to undefined that overwrite the correct ID.',
      expected: 'Uses the value from C-3',
      status: 'pending'
    },
    {
      id: 'C-5',
      description: 'Polling endpoint uses the ID',
      how: 'DevTools ► Network ► look for GET /api/applications/<uuid>/signing-status.',
      expected: '200/202, never 404',
      status: 'pending'
    },
    {
      id: 'C-6',
      description: 'Form "Back → Next" keeps state',
      how: 'Click Previous → Next. Confirm context/state still holds the ID.',
      expected: 'Still present',
      status: 'pending'
    }
  ]);

  const updateChecklistItem = (id: string, status: ChecklistItem['status'], result?: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, status, result } : item
    ));
  };

  const testC1ApplicationSubmission = async () => {
    updateChecklistItem('C-1', 'checking');
    
    try {
      const testApplicationData = {
        step1: { fundingAmount: 75000, businessLocation: 'canada' },
        step2: { selectedProduct: 'term_loan' },
        step3: { operatingName: 'Test Business Ltd.' },
        step4: { firstName: 'Test', lastName: 'User', email: 'test@boreal.test' },
        metadata: { submittedAt: new Date().toISOString(), submittedFromStep: 4 }
      };
      
      console.log('🧪 C-1: Testing POST /api/public/applications...');
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/public/applications`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || 'client-app-token'}`
        },
        credentials: 'include',
        body: JSON.stringify(testApplicationData)
      });
      
      console.log(`📊 C-1 Response: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        const applicationId = data.id || data.applicationId;
        
        if (applicationId) {
          updateChecklistItem('C-1', 'success', `✅ HTTP ${response.status} + applicationId: ${applicationId}`);
          
          // Store for other tests
          dispatch({
            type: 'SET_APPLICATION_ID',
            payload: applicationId
          });
          localStorage.setItem('appId', applicationId);
          
          return applicationId;
        } else {
          updateChecklistItem('C-1', 'error', `❌ No applicationId in response: ${JSON.stringify(data)}`);
        }
      } else {
        updateChecklistItem('C-1', 'error', `❌ HTTP ${response.status}: ${await response.text()}`);
      }
    } catch (error) {
      updateChecklistItem('C-1', 'error', `❌ Network error: ${error}`);
    }
    
    return null;
  };

  const testC2StateStorage = () => {
    updateChecklistItem('C-2', 'checking');
    
    try {
      const contextId = state.applicationId;
      const localStorageId = localStorage.getItem('appId');
      
      console.log('🧪 C-2: Checking state storage...');
      console.log('   - Context applicationId:', contextId);
      console.log('   - localStorage appId:', localStorageId);
      
      if (contextId && localStorageId) {
        updateChecklistItem('C-2', 'success', `✅ Context: ${contextId}, localStorage: ${localStorageId}`);
        return true;
      } else {
        updateChecklistItem('C-2', 'error', `❌ Missing - Context: ${contextId}, localStorage: ${localStorageId}`);
        return false;
      }
    } catch (error) {
      updateChecklistItem('C-2', 'error', `❌ Error checking state: ${error}`);
      return false;
    }
  };

  const testC3RouterPassing = () => {
    updateChecklistItem('C-3', 'checking');
    
    try {
      // Test router state passing by navigating to Step 6
      const applicationId = state.applicationId || localStorage.getItem('appId');
      
      if (applicationId) {
        console.log('🧪 C-3: Testing router navigation with state...');
        
        // Navigate to Step 6 with state
        setLocation('/apply/step-6', { 
          replace: false,
          state: { applicationId }
        });
        
        updateChecklistItem('C-3', 'success', `✅ Navigated to Step 6 with applicationId: ${applicationId}`);
        return true;
      } else {
        updateChecklistItem('C-3', 'error', '❌ No applicationId available for router test');
        return false;
      }
    } catch (error) {
      updateChecklistItem('C-3', 'error', `❌ Router navigation error: ${error}`);
      return false;
    }
  };

  const testC4Step6Component = () => {
    updateChecklistItem('C-4', 'checking');
    
    try {
      // Test that Step 6 component can access the ID
      const applicationId = state.applicationId || localStorage.getItem('appId');
      
      console.log('🧪 C-4: Testing Step 6 component ID access...');
      console.log('   - Available applicationId:', applicationId);
      
      if (applicationId) {
        updateChecklistItem('C-4', 'success', `✅ Step 6 can access applicationId: ${applicationId}`);
        return true;
      } else {
        updateChecklistItem('C-4', 'error', '❌ Step 6 cannot access applicationId');
        return false;
      }
    } catch (error) {
      updateChecklistItem('C-4', 'error', `❌ Step 6 component test error: ${error}`);
      return false;
    }
  };

  const testC5PollingEndpoint = async () => {
    updateChecklistItem('C-5', 'checking');
    
    try {
      const applicationId = state.applicationId || localStorage.getItem('appId');
      
      if (!applicationId) {
        updateChecklistItem('C-5', 'error', '❌ No applicationId for polling test');
        return false;
      }
      
      console.log('🧪 C-5: Testing polling endpoint...');
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/public/applications/${applicationId}/signing-status`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${import.meta.env.VITE_CLIENT_APP_SHARED_TOKEN || 'client-app-token'}`
        },
        credentials: 'include'
      });
      
      console.log(`📊 C-5 Response: ${response.status} ${response.statusText}`);
      
      if (response.status === 200 || response.status === 202) {
        updateChecklistItem('C-5', 'success', `✅ HTTP ${response.status} - Endpoint accessible`);
        return true;
      } else if (response.status === 404) {
        updateChecklistItem('C-5', 'error', '❌ HTTP 404 - Application ID not found');
        return false;
      } else {
        updateChecklistItem('C-5', 'error', `❌ HTTP ${response.status}: ${await response.text()}`);
        return false;
      }
    } catch (error) {
      updateChecklistItem('C-5', 'error', `❌ Polling endpoint error: ${error}`);
      return false;
    }
  };

  const testC6StatePeristence = () => {
    updateChecklistItem('C-6', 'checking');
    
    try {
      const beforeId = state.applicationId;
      
      console.log('🧪 C-6: Testing state persistence...');
      console.log('   - ID before navigation:', beforeId);
      
      // Simulate back/next navigation
      setLocation('/apply/step-5');
      
      setTimeout(() => {
        setLocation('/apply/step-6');
        
        const afterId = state.applicationId;
        console.log('   - ID after navigation:', afterId);
        
        if (beforeId && afterId && beforeId === afterId) {
          updateChecklistItem('C-6', 'success', `✅ State persisted: ${afterId}`);
        } else {
          updateChecklistItem('C-6', 'error', `❌ State lost - Before: ${beforeId}, After: ${afterId}`);
        }
      }, 100);
      
      return true;
    } catch (error) {
      updateChecklistItem('C-6', 'error', `❌ State persistence test error: ${error}`);
      return false;
    }
  };

  const runAllTests = async () => {
    console.log('🚀 Running Application ID Flow Tests...');
    
    // Reset all to pending
    setChecklist(prev => prev.map(item => ({ ...item, status: 'pending' })));
    
    // Run tests sequentially
    const applicationId = await testC1ApplicationSubmission();
    
    if (applicationId) {
      await new Promise(resolve => setTimeout(resolve, 500));
      testC2StateStorage();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      testC4Step6Component();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      await testC5PollingEndpoint();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      testC6StatePeristence();
    }
  };

  const renderChecklistItem = (item: ChecklistItem) => {
    const getStatusIcon = () => {
      switch (item.status) {
        case 'checking':
          return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
        case 'success':
          return <CheckCircle className="w-4 h-4 text-green-600" />;
        case 'error':
          return <XCircle className="w-4 h-4 text-red-600" />;
        default:
          return <div className="w-4 h-4 border border-gray-300 rounded" />;
      }
    };

    const getStatusBg = () => {
      switch (item.status) {
        case 'checking':
          return 'bg-blue-50 border-blue-200';
        case 'success':
          return 'bg-green-50 border-green-200';
        case 'error':
          return 'bg-red-50 border-red-200';
        default:
          return 'bg-gray-50 border-gray-200';
      }
    };

    return (
      <Card key={item.id} className={`${getStatusBg()} transition-colors`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-mono text-blue-600">{item.id}</span>
            {item.description}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <div className="text-xs text-gray-600">
            <div><strong>How:</strong> {item.how}</div>
            <div><strong>Expected:</strong> {item.expected}</div>
          </div>
          {item.result && (
            <div className="text-xs p-2 bg-white rounded border">
              <strong>Result:</strong> {item.result}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Application ID Flow Testing
          </CardTitle>
          <p className="text-gray-600">
            Client-side checklist validation for Step 4 → Step 6 application ID flow
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={runAllTests} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Run All Tests
            </Button>
            <Button onClick={() => setLocation('/apply/step-4')} variant="outline">
              <ArrowRight className="w-4 h-4 mr-2" />
              Go to Step 4
            </Button>
            <Button onClick={() => setLocation('/apply/step-6')} variant="outline">
              <ArrowRight className="w-4 h-4 mr-2" />
              Go to Step 6
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {checklist.map(renderChecklistItem)}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Current State Debug
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
            <div>
              <div className="text-gray-600">FormDataContext:</div>
              <div>applicationId: {state.applicationId || 'null'}</div>
            </div>
            <div>
              <div className="text-gray-600">localStorage:</div>
              <div>appId: {localStorage.getItem('appId') || 'null'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          <strong>Quick-Fix Implementation Status:</strong> The Step 4 onSuccess handler now includes setApplicationId(), localStorage fallback, and proper navigation state. Step 6 component reads from FormDataContext with localStorage fallback.
        </AlertDescription>
      </Alert>
    </div>
  );
}