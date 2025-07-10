/**
 * Simple SignNow Test - Complete SignNow Integration Test
 */

import React, { useState } from 'react';
import { SignNowIframe } from '@/components/SignNowIframe';

interface SignNowResponse {
  status: string;
  signnow_url?: string;
  error?: string;
  message?: string;
}

export default function SimpleSignNowTest() {
  const testUUID = "11111111-2222-3333-4444-555555555555";
  const [signingUrl, setSigningUrl] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    console.log('🔍 SignNow Direct Test - Making API call to staff backend');
    console.log('📋 VERIFICATION STEP 1: Application ID Details');
    console.log('  → Application ID being sent:', testUUID);
    console.log('  → Application ID type:', typeof testUUID);
    console.log('  → Application ID length:', testUUID.length);
    console.log('  → Is valid UUID format:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(testUUID));
    console.log('  → Is undefined/null:', testUUID === undefined || testUUID === null);
    
    console.log('📋 VERIFICATION STEP 2: Endpoint Details');
    const endpoint = `https://staff.boreal.financial/api/applications/${testUUID}/signnow`;
    console.log('  → Full endpoint URL:', endpoint);
    console.log('  → Method: POST');
    console.log('  → Content-Type: application/json');
    
    setIsLoading(true);
    setStatus('Making SignNow API request...');
    
    try {
      console.log('📋 VERIFICATION STEP 3: Making Request');
      console.log('  → Sending SignNow request for Application ID:', testUUID);
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      console.log('📋 VERIFICATION STEP 4: Response Analysis');
      console.log('  → Response status:', response.status);
      console.log('  → Response status text:', response.statusText);
      console.log('  → Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('  → Response OK:', response.ok);
      
      const responseText = await response.text();
      console.log('  → Raw response text:', responseText);
      
      let data: SignNowResponse;
      try {
        data = JSON.parse(responseText);
        console.log('  → Parsed JSON response:', data);
      } catch (parseError) {
        console.log('  → JSON parse error:', parseError);
        console.log('  → Response is not valid JSON, likely HTML/CORS error');
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
      }
      
      console.log('📋 VERIFICATION STEP 5: Response Content Analysis');
      console.log('  → Response structure:', Object.keys(data));
      console.log('  → Has status field:', 'status' in data);
      console.log('  → Has signnow_url field:', 'signnow_url' in data);
      console.log('  → Has error field:', 'error' in data);
      
      // Handle successful signing creation
      if (data.status === 'signing_created' && data.signnow_url) {
        setSigningUrl(data.signnow_url);
        setStatus('✅ SignNow URL received - Iframe loaded below');
        console.log('✅ SignNow URL received:', data.signnow_url);
      } 
      // Handle other success cases
      else if (response.ok) {
        setStatus(`✅ API Success: ${data.status || 'Response received'}`);
        alert(JSON.stringify(data, null, 2));
      }
      // Handle error responses
      else {
        setStatus(`❌ API Error (${response.status}): ${data.error || data.message || 'Unknown error'}`);
        alert(JSON.stringify(data, null, 2));
      }
      
    } catch (error) {
      console.log('📋 VERIFICATION STEP 6: Error Analysis');
      console.log('  → Error type:', error?.constructor?.name);
      console.log('  → Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.log('  → Full error object:', error);
      
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ SignNow API Error:', error);
      setStatus(`❌ Network Error: ${errorMsg}`);
      alert(`Error: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedirect = () => {
    if (signingUrl) {
      window.open(signingUrl, '_blank');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Complete SignNow Integration Test</h1>
      
      {/* API Test Section */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">SignNow API Test</h2>
        <p className="text-gray-600 mb-4">
          Test UUID: <code className="bg-gray-100 px-2 py-1 rounded">{testUUID}</code>
        </p>
        <p className="text-sm text-blue-600 mb-4">
          Expected Response: {`{"status": "signing_created", "signnow_url": "..."}`}
        </p>
        
        <button 
          onClick={handleClick}
          disabled={isLoading}
          className={`px-6 py-3 rounded font-medium ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          {isLoading ? 'Testing API...' : 'Test SignNow API (Complete Flow)'}
        </button>
        
        {status && (
          <div className={`mt-4 p-3 rounded ${
            status.includes('✅') ? 'bg-green-50 text-green-800' : 
            status.includes('❌') ? 'bg-red-50 text-red-800' : 
            'bg-blue-50 text-blue-800'
          }`}>
            {status}
          </div>
        )}
      </div>

      {/* SignNow URL Actions */}
      {signingUrl && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">SignNow URL Received</h2>
          <p className="text-gray-600 mb-4">
            Signing URL: <code className="bg-gray-100 px-2 py-1 rounded text-sm break-all">{signingUrl}</code>
          </p>
          
          <div className="flex gap-4 mb-6">
            <button 
              onClick={handleRedirect}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Open in New Tab
            </button>
          </div>
        </div>
      )}

      {/* Embedded SignNow Iframe */}
      {signingUrl && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Embedded SignNow Signing</h2>
          <SignNowIframe 
            signingUrl={signingUrl}
            onComplete={() => {
              console.log('🎉 Document signing completed successfully');
              setStatus('🎉 Document signing completed successfully!');
            }}
            onError={(error) => {
              console.error('SignNow iframe error:', error);
              setStatus(`❌ Signing Error: ${error}`);
            }}
          />
          <p className="text-sm text-gray-500 mt-2">
            If the iframe doesn't load, use the "Open in New Tab" button above.
          </p>
        </div>
      )}

      {/* Debug Information */}
      <div className="bg-gray-50 border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Debug Information & Verification Steps</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-medium text-gray-800 mb-2">1. Application ID Verification</h3>
            <ul className="space-y-1 ml-4">
              <li><strong>ID Value:</strong> {testUUID}</li>
              <li><strong>ID Type:</strong> {typeof testUUID}</li>
              <li><strong>ID Length:</strong> {testUUID.length} characters</li>
              <li><strong>UUID Format:</strong> {/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(testUUID) ? '✅ Valid' : '❌ Invalid'}</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 mb-2">2. Endpoint Configuration</h3>
            <ul className="space-y-1 ml-4">
              <li><strong>URL:</strong> https://staff.boreal.financial/api/applications/{testUUID}/signnow</li>
              <li><strong>Method:</strong> POST</li>
              <li><strong>Headers:</strong> Content-Type: application/json</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 mb-2">3. Expected Response Types</h3>
            <ul className="space-y-1 ml-4">
              <li><strong>Success:</strong> {`{"status": "signing_created", "signnow_url": "..."}`}</li>
              <li><strong>Not Found:</strong> {`{"error": "Application not found", "requested_id": "..."}`}</li>
              <li><strong>CORS Error:</strong> HTML response or network failure</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 mb-2">4. Troubleshooting</h3>
            <ul className="space-y-1 ml-4">
              <li>• Check browser DevTools → Network tab for the signnow request</li>
              <li>• Look for HTTP status code and response content type</li>
              <li>• Verify console logs show all verification steps</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}