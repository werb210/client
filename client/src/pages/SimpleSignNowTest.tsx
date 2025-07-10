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
  const testUUID = "12345678-1234-5678-9abc-123456789012";
  const [signingUrl, setSigningUrl] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    console.log('🔍 SignNow Direct Test - Making API call to staff backend');
    console.log('Test UUID:', testUUID);
    
    setIsLoading(true);
    setStatus('Making SignNow API request...');
    
    try {
      const response = await fetch(`https://staff.boreal.financial/api/applications/${testUUID}/signnow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      const data: SignNowResponse = await response.json();
      console.log('SignNow API Response:', data);
      
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
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('SignNow API Error:', error);
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
        <h2 className="text-lg font-semibold mb-4">Debug Information</h2>
        <ul className="space-y-2 text-sm">
          <li><strong>API Endpoint:</strong> https://staff.boreal.financial/api/applications/{testUUID}/signnow</li>
          <li><strong>Method:</strong> POST</li>
          <li><strong>Headers:</strong> Content-Type: application/json</li>
          <li><strong>Expected Flow:</strong> API call → JSON response → Extract signnow_url → Show iframe/redirect</li>
        </ul>
      </div>
    </div>
  );
}