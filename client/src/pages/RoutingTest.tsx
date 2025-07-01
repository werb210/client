import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function RoutingTest() {
  const [location, setLocation] = useLocation();
  const [clickLog, setClickLog] = useState<string[]>([]);

  const handleTestClick = () => {
    const timestamp = new Date().toISOString();
    console.log('Button clicked at:', timestamp);
    console.log('Current location:', location);
    console.log('About to navigate to: /apply/step-1');
    
    setClickLog(prev => [...prev, `${timestamp}: Clicked Apply button, navigating to /apply/step-1`]);
    
    setLocation('/apply/step-1');
  };

  const handleClearLog = () => {
    setClickLog([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Routing Debug Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Route Information</h2>
          <p><strong>Current Location:</strong> {location}</p>
          <p><strong>Expected Route:</strong> /apply/step-1</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Apply Button</h2>
          <Button 
            onClick={handleTestClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
          >
            Test Apply Button (Should go to /apply/step-1)
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Click Log</h2>
            <Button onClick={handleClearLog} variant="outline" size="sm">
              Clear Log
            </Button>
          </div>
          <div className="space-y-2">
            {clickLog.length === 0 ? (
              <p className="text-gray-500">No clicks logged yet</p>
            ) : (
              clickLog.map((log, index) => (
                <div key={index} className="text-sm bg-gray-100 p-2 rounded">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6">
          <Button 
            onClick={() => setLocation('/')}
            variant="ghost"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}