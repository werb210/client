import { useState, useEffect } from 'react';
import { useFormData } from '@/context/FormDataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Monitor, Tablet, Smartphone } from 'lucide-react';

// Import all step components
import Step1FinancialProfile from '@/routes/Step1_FinancialProfile';
import Step2Recommendations from '@/routes/Step2_Recommendations';
import Step3BusinessDetails from '@/routes/Step3_BusinessDetails';
import Step4FinancialInfo from '@/routes/Step4_FinancialInfo';
import Step5DocumentUpload from '@/routes/Step5_DocumentUpload';
import Step6Signature from '@/routes/Step6_Signature';

const steps = [
  { id: 1, title: 'Financial Profile', component: Step1FinancialProfile },
  { id: 2, title: 'Recommendations', component: Step2Recommendations },
  { id: 3, title: 'Business Details', component: Step3BusinessDetails },
  { id: 4, title: 'Financial Info', component: Step4FinancialInfo },
  { id: 5, title: 'Document Upload', component: Step5DocumentUpload },
  { id: 6, title: 'Signature', component: Step6Signature },
];

export default function SideBySideApplication() {
  const { state } = useFormData();
  const [visibleSteps, setVisibleSteps] = useState(3); // Show 3 steps at a time
  const [startIndex, setStartIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Responsive design - adjust visible steps based on screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1200) {
        setVisibleSteps(3);
        setViewMode('desktop');
      } else if (width >= 768) {
        setVisibleSteps(2);
        setViewMode('tablet');
      } else {
        setVisibleSteps(1);
        setViewMode('mobile');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const canScrollLeft = startIndex > 0;
  const canScrollRight = startIndex + visibleSteps < steps.length;

  const scrollLeft = () => {
    if (canScrollLeft) {
      setStartIndex(startIndex - 1);
    }
  };

  const scrollRight = () => {
    if (canScrollRight) {
      setStartIndex(startIndex + 1);
    }
  };

  const getStepStatus = (stepId: number) => {
    switch (stepId) {
      case 1:
        return state.step1FinancialProfile ? 'completed' : 'current';
      case 2:
        return state.step1FinancialProfile?.selectedCategory ? 'completed' : 
               state.step1FinancialProfile ? 'current' : 'pending';
      case 3:
        return state.step3BusinessDetails ? 'completed' :
               state.step1FinancialProfile?.selectedCategory ? 'current' : 'pending';
      case 4:
        return state.step4FinancialInfo ? 'completed' :
               state.step3BusinessDetails ? 'current' : 'pending';
      case 5:
        return state.step5DocumentUpload ? 'completed' :
               state.step4FinancialInfo ? 'current' : 'pending';
      case 6:
        return state.step5DocumentUpload ? 'current' : 'pending';
      default:
        return 'pending';
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50 dark:bg-green-950';
      case 'current':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-900';
    }
  };

  const visibleStepsList = steps.slice(startIndex, startIndex + visibleSteps);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Boreal Financial Application
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Complete your application step by step - all steps visible side by side
          </p>
        </div>

        {/* Navigation Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <Button
              variant="outline"
              onClick={scrollRight}
              disabled={!canScrollRight}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Button
              variant={viewMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setVisibleSteps(3);
                setViewMode('desktop');
              }}
              className="flex items-center gap-1 h-8"
            >
              <Monitor className="h-3 w-3" />
              <span className="hidden sm:inline">Desktop</span>
            </Button>
            <Button
              variant={viewMode === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setVisibleSteps(2);
                setViewMode('tablet');
              }}
              className="flex items-center gap-1 h-8"
            >
              <Tablet className="h-3 w-3" />
              <span className="hidden sm:inline">Tablet</span>
            </Button>
            <Button
              variant={viewMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setVisibleSteps(1);
                setViewMode('mobile');
              }}
              className="flex items-center gap-1 h-8"
            >
              <Smartphone className="h-3 w-3" />
              <span className="hidden sm:inline">Mobile</span>
            </Button>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Showing steps {startIndex + 1}-{Math.min(startIndex + visibleSteps, steps.length)} of {steps.length}
          </div>
        </div>

        {/* Side-by-side Steps */}
        <div 
          className="grid gap-4 lg:gap-6" 
          style={{ 
            gridTemplateColumns: `repeat(${visibleSteps}, 1fr)`,
            minHeight: '600px'
          }}
        >
          {visibleStepsList.map((step) => {
            const StepComponent = step.component;
            const status = getStepStatus(step.id);
            const colorClass = getStepColor(status);

            return (
              <Card key={step.id} className={`${colorClass} border-2 transition-all duration-200`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>Step {step.id}: {step.title}</span>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                      status === 'current' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {status === 'completed' ? 'Complete' : 
                       status === 'current' ? 'Active' : 'Pending'}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px] p-4">
                    <div className="space-y-4">
                      <StepComponent />
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Progress Summary */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-2 mb-4">
            {steps.map((step) => {
              const status = getStepStatus(step.id);
              return (
                <div
                  key={step.id}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    status === 'completed' ? 'bg-green-500' :
                    status === 'current' ? 'bg-blue-500' :
                    'bg-gray-300'
                  }`}
                />
              );
            })}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {steps.filter((_, i) => getStepStatus(i + 1) === 'completed').length} of {steps.length} steps completed
          </p>
        </div>
      </div>
    </div>
  );
}