import React from 'react';
import { Step5Documents } from '@/components/Step5Documents';

export default function Step5Test() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Step 5 Document Upload Test</h1>
          <p className="text-lg text-gray-600">
            Professional document upload system with dynamic requirements
          </p>
        </div>
        
        <Step5Documents />
      </div>
    </div>
  );
}