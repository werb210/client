import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, AlertTriangle } from "lucide-react";

interface ApplicationStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationStatus: string;
}

export function ApplicationStatusModal({ isOpen, onClose, applicationStatus }: ApplicationStatusModalProps) {
  if (!isOpen) return null;

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'lender_match':
        return {
          title: 'Application Already Processed',
          message: 'This application has been matched with lenders and is under review. You cannot resubmit finalized applications.',
          icon: '🔄'
        };
      case 'submitted':
        return {
          title: 'Application Already Submitted',
          message: 'This application has already been submitted to lenders. You cannot resubmit finalized applications.',
          icon: '✅'
        };
      case 'approved':
        return {
          title: 'Application Approved',
          message: 'This application has been approved. You cannot resubmit finalized applications.',
          icon: '🎉'
        };
      case 'rejected':
        return {
          title: 'Application Rejected',
          message: 'This application has been rejected. You cannot resubmit finalized applications.',
          icon: '❌'
        };
      default:
        return {
          title: 'Application Already Processed',
          message: `This application status is '${status}'. Only draft applications can be submitted.`,
          icon: '🚫'
        };
    }
  };

  const statusInfo = getStatusMessage(applicationStatus);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white dark:bg-gray-800 border-orange-200 dark:border-orange-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{statusInfo.icon}</span>
              <CardTitle className="text-orange-700 dark:text-orange-300">
                🚫 Submission Blocked
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 hover:bg-orange-100 dark:hover:bg-orange-900"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h4 className="font-medium text-orange-800 dark:text-orange-200">
                  {statusInfo.title}
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {statusInfo.message}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Application Status: <span className="font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{applicationStatus}</span>
            </p>
          </div>
          
          <div className="flex justify-end pt-2">
            <Button 
              onClick={onClose} 
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}