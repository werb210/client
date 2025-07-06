import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Monitor, Tablet, Smartphone } from '@/lib/icons';

interface SideBySideLayoutProps {
  steps: Array<{
    id: number;
    title: string;
    component: React.ComponentType<any>;
  }>;
  getStepStatus: (stepId: number) => 'completed' | 'current' | 'pending';
  children?: React.ReactNode;
}

export function SideBySideLayout({ steps, getStepStatus }: SideBySideLayoutProps) {
  const [visibleSteps, setVisibleSteps] = useState(3);
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

  const visibleStepsData = steps.slice(startIndex, startIndex + visibleSteps);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Boreal Financial Application
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Complete your business financing application step by step
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
        </div>

        {/* Steps Grid */}
        <div className={`grid gap-6 ${
          visibleSteps === 3 ? 'grid-cols-1 lg:grid-cols-3' :
          visibleSteps === 2 ? 'grid-cols-1 md:grid-cols-2' :
          'grid-cols-1'
        }`}>
          {visibleStepsData.map((step) => {
            const status = getStepStatus(step.id);
            const StepComponent = step.component;

            return (
              <Card 
                key={step.id} 
                className={`${getStepColor(status)} border-2 transition-all duration-200 hover:shadow-lg`}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      status === 'completed' ? 'bg-green-500 text-white' :
                      status === 'current' ? 'bg-blue-500 text-white' :
                      'bg-gray-300 text-gray-600'
                    }`}>
                      {step.id}
                    </div>
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <StepComponent />
                  </ScrollArea>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Application Progress
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Step {startIndex + 1}-{Math.min(startIndex + visibleSteps, steps.length)} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((startIndex + visibleSteps) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}