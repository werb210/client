/**
 * Simple SignNow Test - Basic Working Test Page
 */

import React from 'react';

export default function SimpleSignNowTest() {
  const applicationId = "550e8400-e29b-41d4-a716-446655440000";

  const handleClick = async () => {
    console.log('🔍 SignNow Direct Test - Making API call to staff backend');
    
    try {
      const response = await fetch(`https://staff.boreal.financial/api/applications/${applicationId}/signnow`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        }
      });
      
      const data = await response.json();
      console.log('SignNow API Response:', data);
      alert(JSON.stringify(data, null, 2));
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('SignNow API Error:', error);
      alert(`Error: ${errorMsg}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Simple SignNow Test</h1>
      
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Test SignNow API</h2>
        <p className="text-gray-600 mb-4">
          Current UUID: <code className="bg-gray-100 px-2 py-1 rounded">{applicationId}</code>
        </p>
        
        <button 
          onClick={handleClick}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Test SignNow API (Direct)
        </button>
      </div>
    </div>
  );
}