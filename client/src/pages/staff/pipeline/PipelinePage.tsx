import React, { createContext, useContext, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PipelineBoard } from './PipelineBoard';
import { PipelineDrawer } from './PipelineDrawer';

// Pipeline Context for shared state management
interface PipelineContextType {
  openDrawerId: string | null;
  setOpenDrawerId: (id: string | null) => void;
  selectedApplication: any | null;
  setSelectedApplication: (app: any | null) => void;
}

const PipelineContext = createContext<PipelineContextType | undefined>(undefined);

export const usePipelineContext = () => {
  const context = useContext(PipelineContext);
  if (!context) {
    throw new Error('usePipelineContext must be used within PipelineProvider');
  }
  return context;
};

/**
 * Sales Pipeline - Main View
 * Single route for the entire pipeline functionality
 * Uses React Context for shared state between board and drawer
 */
export default function PipelinePage() {
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);

  // Load all applications from staff API
  const { data: applicationsData, isLoading, error } = useQuery({
    queryKey: ['/api/applications'],
    staleTime: 30000, // 30 seconds
  });

  const applications = Array.isArray(applicationsData) ? applicationsData : [];

  const contextValue: PipelineContextType = {
    openDrawerId,
    setOpenDrawerId,
    selectedApplication,
    setSelectedApplication,
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Sales Pipeline</h1>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="h-[600px]">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-24 w-full" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Pipeline Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">
              Failed to load applications: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PipelineContext.Provider value={contextValue}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Sales Pipeline</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {applications.length} Total Applications
              </span>
            </div>
          </div>
        </div>

        {/* Pipeline Board */}
        <div className="flex-1 overflow-hidden">
          <PipelineBoard applications={applications} />
        </div>

        {/* Drawer */}
        <PipelineDrawer 
          isOpen={!!openDrawerId}
          applicationId={openDrawerId}
          onClose={() => {
            setOpenDrawerId(null);
            setSelectedApplication(null);
          }}
        />
      </div>
    </PipelineContext.Provider>
  );
}