import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import { StageMonitor } from '@/components/StageMonitor';
import { AutoSaveIndicator } from '@/components/AutoSaveIndicator';
import { ProgressMonitor } from '@/components/ProgressMonitor';
import Building from 'lucide-react/dist/esm/icons/building';
import Target from 'lucide-react/dist/esm/icons/target';
import User from 'lucide-react/dist/esm/icons/user';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Upload from 'lucide-react/dist/esm/icons/upload';
import FileSignature from 'lucide-react/dist/esm/icons/file-signature';

const steps = [
  { title: "Financial Profile", icon: Building },
  { title: "Recommendations", icon: Target },
  { title: "Business Details", icon: User },
  { title: "Applicant Info", icon: FileText },
  { title: "Documents", icon: Upload },
  { title: "Submit & Sign", icon: FileSignature },
];

export default function StageMonitorTest() {
  const [currentStep, setCurrentStep] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | null>('saved');
  const [lastSaveTime, setLastSaveTime] = useState('12:34 PM');

  const simulateAutoSave = () => {
    setAutoSaveStatus('saving');
    setTimeout(() => {
      setAutoSaveStatus('saved');
      setLastSaveTime(new Date().toLocaleTimeString());
    }, 1500);
  };

  const simulateError = () => {
    setAutoSaveStatus('error');
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      simulateAutoSave();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      simulateAutoSave();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Stage Monitor & Auto-Save System Test
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Professional progress tracking with automatic data persistence
          </p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Stage Monitor Components</CardTitle>
              <AutoSaveIndicator status={autoSaveStatus} lastSaveTime={lastSaveTime} />
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Integrated Stage Monitor */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Complete Stage Monitor</h3>
              <StageMonitor currentStep={currentStep} />
            </div>

            {/* Individual Progress Monitor */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Progress Monitor Component</h3>
              <ProgressMonitor steps={steps} currentStep={currentStep} />
            </div>

            {/* Current Step Display */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Current Step: {steps[currentStep].title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Step {currentStep + 1} of {steps.length} - 
                {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
              </p>
              
              {/* Simulated form content */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sample Field 1</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md"
                      placeholder="Form field example"
                      onChange={simulateAutoSave}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sample Field 2</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md"
                      placeholder="Another field"
                      onChange={simulateAutoSave}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Test Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button 
                  onClick={nextStep}
                  disabled={currentStep === steps.length - 1}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={simulateAutoSave}>
                  Trigger Auto-Save
                </Button>
                <Button variant="outline" size="sm" onClick={simulateError}>
                  Simulate Error
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAutoSaveStatus(null)}>
                  Reset Status
                </Button>
              </div>
            </div>

            {/* Feature List */}
            <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-teal-800 dark:text-teal-200">
                🎯 Stage Monitor Features
              </h3>
              <ul className="space-y-2 text-sm text-teal-700 dark:text-teal-300">
                <li>✅ Visual progress tracking with desktop horizontal steps and mobile vertical progress bar</li>
                <li>✅ Automatic data saving with real-time localStorage persistence</li>
                <li>✅ Intelligent form data restoration with 72-hour expiration</li>
                <li>✅ Security controls preventing restoration to sensitive steps (signature/submission)</li>
                <li>✅ Professional UI with Boreal Financial teal and orange branding</li>
                <li>✅ Mobile responsive design optimized for all screen sizes</li>
                <li>✅ Auto-save status indicator with save time display</li>
                <li>✅ Error handling and user feedback for save failures</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}