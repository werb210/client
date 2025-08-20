import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Temporarily simplified tabs for initial deployment
const ApplicationTab = ({ data }: { data: any }) => <div className="p-4">Application details for {data?.businessName || 'Unknown'}</div>;
const BankingTab = ({ data }: { data: any }) => <div className="p-4">Banking information loading...</div>;
const FinancialsTab = ({ data }: { data: any }) => <div className="p-4">Financial data loading...</div>;
const DocumentsTab = ({ data }: { data: any }) => <div className="p-4">Document management loading...</div>;
const LendersTab = ({ data }: { data: any }) => <div className="p-4">Lender matches loading...</div>;

interface PipelineDrawerProps {
  isOpen: boolean;
  applicationId: string | null;
  onClose: () => void;
}

/**
 * Pipeline Drawer with Application Detail Tabs
 * Loads detailed application data and displays organized tabs
 */
export function PipelineDrawer({ isOpen, applicationId, onClose }: PipelineDrawerProps) {
  // Load detailed application data when drawer opens
  const { data: applicationDetails = {}, isLoading, error } = useQuery({
    queryKey: ['/api/application', applicationId, 'details'],
    enabled: !!applicationId && isOpen,
    staleTime: 60000, // 1 minute
  });

  if (!isOpen || !applicationId) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl w-full">
        <SheetHeader className="mb-6">
          <SheetTitle>
            {(applicationDetails as any)?.businessName || `Application #${applicationId}`}
          </SheetTitle>
          <SheetDescription>
            View and manage application details across all categories
          </SheetDescription>
        </SheetHeader>

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        )}

        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">Error Loading Application</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">
                Failed to load application details: {error.message}
              </p>
            </CardContent>
          </Card>
        )}

        {applicationDetails && (
          <Tabs defaultValue="application" className="h-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="application" className="text-xs">
                Application
              </TabsTrigger>
              <TabsTrigger value="banking" className="text-xs">
                Banking
              </TabsTrigger>
              <TabsTrigger value="financials" className="text-xs">
                Financials
              </TabsTrigger>
              <TabsTrigger value="documents" className="text-xs">
                Documents
              </TabsTrigger>
              <TabsTrigger value="lenders" className="text-xs">
                Lenders
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 h-[calc(100vh-200px)] overflow-y-auto">
              <TabsContent value="application" className="mt-0">
                <ApplicationTab applicationDetails={applicationDetails} />
              </TabsContent>

              <TabsContent value="banking" className="mt-0">
                <BankingTab applicationDetails={applicationDetails} />
              </TabsContent>

              <TabsContent value="financials" className="mt-0">
                <FinancialsTab applicationDetails={applicationDetails} />
              </TabsContent>

              <TabsContent value="documents" className="mt-0">
                <DocumentsTab applicationDetails={applicationDetails} />
              </TabsContent>

              <TabsContent value="lenders" className="mt-0">
                <LendersTab applicationDetails={applicationDetails} />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}